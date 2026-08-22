import type { IntentResult as IntentResultData } from "../types/intent";

type IntentResultProps = {
  result: IntentResultData;
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export function IntentResult({ result }: IntentResultProps) {
  const entities = Object.entries(result.entities || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  const actions = result.actions || [];

  return (
    <section className="animate-rise border-t border-[#17221d]/12 py-12 lg:py-16" aria-live="polite">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">02 / Structured response</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Here&apos;s what we heard.</h2>
        </div>
        {result.status && <span className="text-sm capitalize text-[#8a948e]">Status: {result.status}</span>}
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.25rem] bg-[#2e7d63] p-6 text-[#fffdf8] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c6e0d2]">Detected intent</p>
          <h3 className="mt-5 text-3xl font-semibold capitalize tracking-[-0.05em]">{result.intent_type?.replaceAll("_", " ") || "Unclassified request"}</h3>
          <p className="mt-12 border-t border-[#fffdf8]/20 pt-4 text-sm leading-6 text-[#dcece4]">{result.summary || "We found a request ready to be turned into action."}</p>
        </div>
        <div className="rounded-[1.25rem] border border-[#17221d]/15 bg-[#fffdf8] p-6 sm:p-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a948e]">Details found</p>
              <div className="mt-5 space-y-3">
                {entities.length > 0 ? entities.map(([key, value]) => (
                  <div key={key} className="border-b border-[#17221d]/10 pb-3">
                    <p className="text-xs capitalize text-[#8a948e]">{key.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-sm font-medium">{displayValue(value)}</p>
                  </div>
                )) : <p className="mt-5 text-sm text-[#8a948e]">No additional details were extracted.</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a948e]">Action plan</p>
              {actions.length > 0 ? (
                <ol className="mt-5 space-y-4">
                  {actions.map((action, index) => (
                    <li key={`${action}-${index}`} className="flex gap-3 text-sm leading-5">
                      <span className="font-mono text-xs text-[#d67845]">{String(index + 1).padStart(2, "0")}</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-5 text-sm text-[#8a948e]">No actions were returned.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
