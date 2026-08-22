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
  executions?: Array<{
    id: number;
    action: string;
    status: "pending" | "running" | "completed" | "failed";
    started_at?: string | null;
    completed_at?: string | null;
    result?: Record<string, unknown>;
    error?: string;
    created_at: string;
  }>;
};

export type AuthSession = {
  token: string;
  user: { id: number; username: string };
};
