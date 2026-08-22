import type { IntentResult } from "../types/intent";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function createIntent(text: string): Promise<IntentResult> {
  const response = await fetch(`${apiUrl}/api/intents/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to process request");
  }

  return response.json() as Promise<IntentResult>;
}
