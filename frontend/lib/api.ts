import type { IntentResult } from "../types/intent";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export type IntentApiErrorKind = "network" | "validation" | "processing" | "api";

export class IntentApiError extends Error {
  constructor(message: string, readonly kind: IntentApiErrorKind) {
    super(message);
    this.name = "IntentApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, options);
  } catch {
    throw new IntentApiError("IntentOS is unavailable right now.", "network");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.error || "IntentOS could not complete that request.";
    const kind = response.status === 400 ? "validation" : response.status === 503 ? "processing" : "api";
    throw new IntentApiError(message, kind);
  }

  return response.json() as Promise<T>;
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
