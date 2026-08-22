export type IntentResult = {
  id?: number;
  raw_text?: string;
  intent_type?: string;
  summary?: string;
  entities?: Record<string, unknown>;
  actions?: string[];
  plan?: unknown;
  status?: string;
  created_at?: string;
  approval?: {
    status: "approved" | "rejected";
    approved_by: string;
    intent_status_at_decision: string;
    created_at: string;
    approved_at?: string | null;
    rejected_at?: string | null;
  } | null;
};

export type AuthSession = {
  token: string;
  user: { id: number; username: string };
};
