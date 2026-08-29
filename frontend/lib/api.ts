import type { AuthSession, IntentResult } from "../types/intent";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

const apiUrl = (
  configuredApiUrl ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "")
).replace(/\/$/, "");

const authStorageKey = "intentos-auth-token";
const authUserKey = "intentos-auth-user";

export type IntentApiErrorKind =
  | "network"
  | "timeout"
  | "validation"
  | "processing"
  | "configuration"
  | "authentication"
  | "api";

export class IntentApiError extends Error {
  constructor(
    message: string,
    readonly kind: IntentApiErrorKind
  ) {
    super(message);
    this.name = "IntentApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!apiUrl) {
    throw new IntentApiError(
      "The backend URL is not configured for this deployment.",
      "configuration"
    );
  }

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(authStorageKey)
      : null;

  const headers = new Headers(options?.headers);

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 15000);

  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new IntentApiError(
        "IntentOS took too long to respond. Please try again.",
        "timeout"
      );
    }

    throw new IntentApiError(
      "IntentOS is unavailable right now.",
      "network"
    );
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    const message =
      data?.error ||
      data?.detail ||
      "IntentOS could not complete that request.";

    let kind: IntentApiErrorKind = "api";

    if (response.status === 400) {
      kind = "validation";
    } else if (response.status === 401) {
      kind = "authentication";
    } else if (response.status === 503) {
      kind = "processing";
    }

    throw new IntentApiError(message, kind);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    const data: unknown = await response.json();
    return data as T;
  } catch {
    throw new IntentApiError(
      "IntentOS returned an unexpected response.",
      "api"
    );
  }
}

/* ---------------- AUTH ---------------- */

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(
    authStorageKey,
    session.token
  );

  window.localStorage.setItem(
    authUserKey,
    JSON.stringify(session.user)
  );
}

export function clearAuthToken() {
  window.localStorage.removeItem(authStorageKey);
  window.localStorage.removeItem(authUserKey);
}

export function loadAuthSession(): AuthSession | null {
  const token =
    window.localStorage.getItem(authStorageKey);

  const user =
    window.localStorage.getItem(authUserKey);

  if (!token || !user) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(user),
    } as AuthSession;
  } catch {
    clearAuthToken();
    return null;
  }
}

/* ---------------- REGISTER ---------------- */

export async function register(
  username: string,
  password: string
): Promise<AuthSession> {
  const session = await request<AuthSession>(
    "/api/intents/auth/register/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  saveAuthSession(session);

  return session;
}

/* ---------------- LOGIN ---------------- */

export async function login(
  username: string,
  password: string
): Promise<AuthSession> {
  const session = await request<AuthSession>(
    "/api/intents/auth/login/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  saveAuthSession(session);

  return session;
}

/* ---------------- LOGOUT ---------------- */

export async function logout(): Promise<void> {
  try {
    await request<void>(
      "/api/intents/auth/logout/",
      {
        method: "POST",
      }
    );
  } finally {
    clearAuthToken();
  }
}

/* ---------------- CURRENT USER ---------------- */

export async function getCurrentUser(): Promise<
  AuthSession["user"]
> {
  return request<AuthSession["user"]>(
    "/api/intents/auth/me/"
  );
}

/* ---------------- CREATE INTENT ---------------- */

export async function createIntent(
  text: string
): Promise<IntentResult> {
  return request<IntentResult>(
    "/api/intents/create/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    }
  );
}

/* ---------------- LIST INTENTS ---------------- */

export async function listIntents(): Promise<IntentResult[]> {
  return request<IntentResult[]>(
    "/api/intents/"
  );
}

/* ---------------- GET INTENT ---------------- */

export async function getIntent(
  id: number
): Promise<IntentResult> {
  return request<IntentResult>(
    `/api/intents/${id}/`
  );
}

/* ---------------- APPROVE ---------------- */

export async function approveIntent(
  id: number
): Promise<IntentResult> {
  return request<IntentResult>(
    `/api/intents/${id}/approve/`,
    {
      method: "POST",
    }
  );
}

/* ---------------- REJECT ---------------- */

export async function rejectIntent(
  id: number
): Promise<IntentResult> {
  return request<IntentResult>(
    `/api/intents/${id}/reject/`,
    {
      method: "POST",
    }
  );
}

/* ---------------- EXECUTE ---------------- */

export async function executeIntent(
  id: number
): Promise<IntentResult> {
  return request<IntentResult>(
    `/api/intents/${id}/execute/`,
    {
      method: "POST",
    }
  );
}