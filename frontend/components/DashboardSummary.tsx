import type { IntentResult } from "../types/intent";

const statuses = ["pending", "planned", "approved", "completed", "failed"];

export function DashboardSummary({ intents }: { intents: IntentResult[] }) {
  return (
    <section className="border-t border-[#17221d]/12 py-8" aria-label="Intent dashboard summary">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] border border-[#17221d]/12 bg-[#17221d]/12 sm:grid-cols-5">
        {statuses.map((status) => (
          <div className="bg-[#fffdf8] p-4 sm:p-5" key={status}>
            <p className="text-2xl font-semibold tracking-[-0.05em]">{intents.filter((intent) => intent.status === status).length}</p>
            <p className="mt-2 text-xs capitalize text-[#8a948e]">{status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
