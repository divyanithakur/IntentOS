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
};
