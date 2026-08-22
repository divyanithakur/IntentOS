"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import type { IntentResult as IntentResultData } from "../types/intent";

type IntentResultProps = {
  result: IntentResultData;
  acting?: boolean;
  actionError?: string;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export function IntentResult({ result, acting = false, actionError, onApprove, onReject }: IntentResultProps) {
  const [confirming, setConfirming] = useState(false);
  const entities = Object.entries(result.entities || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
  const actions = result.actions || [];
  const canDecide = result.status === "planned" && onApprove && onReject;

  return (
    <section className="animate-rise border-t border-[#17221d]/12 py-12 lg:py-16" aria-live="polite">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">02 / Structured response</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Here&apos;s what we heard.</h2>
        </div>
        <StatusBadge status={result.status} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.25rem] bg-[#2e7d63] p-6 text-[#fffdf8] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c6e0d2]">Detected intent</p>
          <h3 className="mt-5 text-3xl font-semibold capitalize tracking-[-0.05em]">{result.intent_type?.replaceAll("_", " ") || "Unclassified request"}</h3>
          <p className="mt-12 border-t border-[#fffdf8]/20 pt-4 text-sm leading-6 text-[#dcece4]">{result.summary || "We found a request ready to be turned into action."}</p>
          {result.approval && <p className="mt-5 text-xs text-[#dcece4]">{result.approval.status === "approved" ? "Approved" : "Rejected"} by {result.approval.approved_by}</p>}
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
      {canDecide && (
        <div className="mt-6 flex flex-col gap-4 rounded-[1.25rem] border border-[#17221d]/15 bg-[#fffdf8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold">This plan is ready for your decision.</p>
            <p className="mt-1 text-xs text-[#8a948e]">Approval authorizes future execution only. No external action runs now.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-[#a33e31]/30 px-4 py-3 text-sm font-semibold text-[#a33e31] hover:border-[#a33e31] disabled:opacity-60" type="button" onClick={() => onReject()} disabled={acting}>Reject</button>
            <button className="rounded-lg bg-[#2e7d63] px-4 py-3 text-sm font-semibold text-[#fffdf8] hover:bg-[#256750] disabled:opacity-60" type="button" onClick={() => setConfirming(true)} disabled={acting}>Approve plan</button>
          </div>
        </div>
      )}
      {confirming && (
        <div className="mt-4 rounded-[1.25rem] border-2 border-[#2e7d63]/30 bg-[#e2efe7] p-5 sm:p-6" role="alertdialog" aria-modal="true" aria-labelledby="approve-title">
          <h3 id="approve-title" className="font-semibold">Approve this action plan?</h3>
          <p className="mt-2 text-sm leading-6 text-[#53605a]">IntentOS will record your approval and authorize these planned actions when execution is enabled. Nothing will execute now.</p>
          <div className="mt-5 flex gap-3">
            <button className="rounded-lg border border-[#17221d]/20 px-4 py-3 text-sm font-semibold" type="button" onClick={() => setConfirming(false)} disabled={acting}>Cancel</button>
            <button className="rounded-lg bg-[#17221d] px-4 py-3 text-sm font-semibold text-[#fffdf8] disabled:opacity-60" type="button" onClick={async () => { await onApprove?.(); setConfirming(false); }} disabled={acting}>{acting ? "Approving..." : "Approve"}</button>
          </div>
        </div>
      )}
      {actionError && <p className="mt-4 text-sm text-[#b64b39]" role="alert">{actionError}</p>}
    </section>
  );
}
