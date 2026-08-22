import type { IntentResult } from "../types/intent";
import type { AuthSession } from "../types/intent";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiUrl = (configuredApiUrl || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "")).replace(/\/$/, "");
const authStorageKey = "intentos-auth-token";

export type IntentApiErrorKind = "network" | "timeout" | "validation" | "processing" | "configuration" | "authentication" | "api";

export class IntentApiError extends Error {
  constructor(message: string, readonly kind: IntentApiErrorKind) {
    super(message);
    this.name = "IntentApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  if (!apiUrl) {
    throw new IntentApiError("The backend URL is not configured for this deployment.", "configuration");
  }
  const token = typeof window !== "undefined" ? window.localStorage.getItem(authStorageKey) : null;
  const headers = new Headers(options?.headers);
  if (token) headers.set("Authorization", `Token ${token}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    response = await fetch(`${apiUrl}${path}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new IntentApiError("IntentOS took too long to respond. Please try again.", "timeout");
    }
    throw new IntentApiError("IntentOS is unavailable right now.", "network");
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.error || "IntentOS could not complete that request.";
    const kind = response.status === 400 ? "validation" : response.status === 401 ? "authentication" : response.status === 503 ? "processing" : "api";
    throw new IntentApiError(message, kind);
  }

  if (response.status === 204) return undefined as T;
  try {
    const data: unknown = await response.json();
    return data as T;
  } catch {
    throw new IntentApiError("IntentOS returned an unexpected response.", "api");
  }
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(authStorageKey, session.token);
  window.localStorage.setItem("intentos-auth-user", JSON.stringify(session.user));
}

export function clearAuthToken() {
  window.localStorage.removeItem(authStorageKey);
  window.localStorage.removeItem("intentos-auth-user");
}

export function loadAuthSession(): AuthSession | null {
  const token = window.localStorage.getItem(authStorageKey);
  const user = window.localStorage.getItem("intentos-auth-user");
  if (!token || !user) return null;
  try {
    return { token, user: JSON.parse(user) } as AuthSession;
  } catch {
    clearAuthToken();
    return null;
  }
}

export async function register(username: string, password: string): Promise<AuthSession> {
  return request<AuthSession>("/api/intents/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string): Promise<AuthSession> {
  return request<AuthSession>("/api/intents/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  await request<void>("/api/intents/auth/logout/", { method: "POST" });
}

export async function getCurrentUser(): Promise<AuthSession["user"]> {
  return request<AuthSession["user"]>("/api/intents/auth/me/");
}

export async function createIntent(text: string): Promise<IntentResult> {
  return request<IntentResult>("/api/intents/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
}

export async function listIntents(): Promise<IntentResult[]> {
  return request<IntentResult[]>("/api/intents/");
}

export async function getIntent(id: number): Promise<IntentResult> {
  return request<IntentResult>(`/api/intents/${id}/`);
}

export async function approveIntent(id: number): Promise<IntentResult> {
  return request<IntentResult>(`/api/intents/${id}/approve/`, { method: "POST" });
}

export async function rejectIntent(id: number): Promise<IntentResult> {
  return request<IntentResult>(`/api/intents/${id}/reject/`, { method: "POST" });
}

export async function executeIntent(id: number): Promise<IntentResult> {
  return request<IntentResult>(`/api/intents/${id}/execute/`, { method: "POST" });
}
