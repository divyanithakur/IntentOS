import type { IntentResult } from "../types/intent";

type IntentHistoryProps = {
  intents: IntentResult[];
  loading: boolean;
  error: string;
  selectedId?: number;
  onSelect: (intent: IntentResult) => void;
};

function formatDate(value?: string) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function IntentHistory({ intents, loading, error, selectedId, onSelect }: IntentHistoryProps) {
  return (
    <section id="history" className="border-t border-[#17221d]/12 py-12 lg:py-16">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">04 / Recent intents</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Your request trail.</h2>
        </div>
        <p className="text-sm text-[#8a948e]">Plans are understood, not executed.</p>
      </div>
      {loading && <p className="text-sm text-[#53605a]">Loading your recent intents...</p>}
      {error && <p className="text-sm text-[#b64b39]" role="alert">{error}</p>}
      {!loading && !error && intents.length === 0 && <p className="border-t border-[#17221d]/10 pt-5 text-sm text-[#8a948e]">Your intent history will appear here.</p>}
      {!loading && !error && intents.length > 0 && (
        <div className="divide-y divide-[#17221d]/10 border-y border-[#17221d]/10">
          {intents.map((intent) => (
            <button
              className={`grid w-full gap-3 py-5 text-left transition-colors hover:bg-[#fffdf8] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8 ${selectedId === intent.id ? "bg-[#fffdf8]" : ""}`}
              type="button"
              key={intent.id}
              onClick={() => onSelect(intent)}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{intent.raw_text}</span>
                <span className="mt-1 block text-xs text-[#8a948e]">{formatDate(intent.created_at)}</span>
              </span>
              <span className="text-xs capitalize text-[#2e7d63]">{intent.intent_type?.replaceAll("_", " ") || "Unclassified"}</span>
              <span className="text-xs capitalize text-[#8a948e]">{intent.status || "pending"}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
