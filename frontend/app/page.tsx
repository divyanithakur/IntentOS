"use client";

import { useEffect, useState } from "react";
import { AuthPanel } from "../components/AuthPanel";
import { DashboardSummary } from "../components/DashboardSummary";
import { Header } from "../components/Header";
import { HowItWorks } from "../components/HowItWorks";
import { IntentHistory } from "../components/IntentHistory";
import { IntentInput } from "../components/IntentInput";
import { IntentResult } from "../components/IntentResult";
import { approveIntent, clearAuthToken, createIntent, getIntent, IntentApiError, listIntents, loadAuthSession, rejectIntent, logout } from "../lib/api";
import type { AuthSession, IntentResult as IntentResultData } from "../types/intent";

export default function Home() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<IntentResultData | null>(null);
  const [history, setHistory] = useState<IntentResultData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [error, setError] = useState("");

  const refreshHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      setHistory(await listIntents());
    } catch {
      setHistoryError("History is unavailable right now.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      setSession(loadAuthSession());
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (session) void Promise.resolve().then(refreshHistory);
  }, [session]);

  const handleAuthenticated = (newSession: AuthSession) => {
    setSession(newSession);
    setError("");
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* Local token cleanup still logs the user out. */ }
    clearAuthToken();
    setSession(null);
    setResult(null);
    setHistory([]);
  };

  const processIntent = async () => {
    if (!text.trim()) {
      setError("Add a request before analyzing it.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await createIntent(text.trim());
      setResult(data);
      setSelectedHistoryId(data.id);
      setHistory((current) => [data, ...current.filter((intent) => intent.id !== data.id)]);
    } catch (requestError) {
      if (requestError instanceof IntentApiError && requestError.kind === "validation") setError("That request needs a little more detail before it can be analyzed.");
      else if (requestError instanceof IntentApiError && requestError.kind === "processing") setError("IntentOS could not process that request right now. Please try again.");
      else setError("We could not reach IntentOS. Check the backend and try again.");
    } finally { setLoading(false); }
  };

  const clearWorkspace = () => {
    setText(""); setResult(null); setError(""); setActionError(""); setSelectedHistoryId(undefined);
  };

  const selectHistory = async (intent: IntentResultData) => {
    if (!intent.id) return;
    setSelectedHistoryId(intent.id);
    try {
      const detail = await getIntent(intent.id);
      setResult(detail); setText(detail.raw_text || ""); setActionError("");
    } catch { setError("That intent could not be loaded. Please try again."); }
  };

  const decide = async (action: "approve" | "reject") => {
    if (!result?.id) return;
    setActionLoading(true); setActionError("");
    try {
      const updated = action === "approve" ? await approveIntent(result.id) : await rejectIntent(result.id);
      setResult(updated);
      setHistory((current) => current.map((intent) => intent.id === updated.id ? updated : intent));
    } catch (requestError) {
      setActionError(requestError instanceof IntentApiError ? requestError.message : "That decision could not be saved.");
    } finally { setActionLoading(false); }
  };

  if (!authReady) return <main className="min-h-screen bg-[#f4f1ea]" />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ea] text-[#17221d]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Header username={session?.user.username} onLogout={handleLogout} />
        <section id="top" className="relative grid gap-12 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pb-24 lg:pt-24">
          <div className="relative z-10 animate-rise">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]"><span className="h-2 w-2 rounded-full bg-[#d67845]" aria-hidden="true" />Intent intelligence for humans</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-7xl lg:text-[6.25rem]">Say what you mean. <span className="text-[#2e7d63]">Make it happen.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#53605a] sm:text-xl">IntentOS turns everyday requests into clear, structured plans your team can act on immediately.</p>
          </div>
          <div className="relative animate-rise-delay pb-2 lg:pb-6"><div className="absolute -right-10 -top-12 h-32 w-32 rounded-full border border-[#d67845]/40 sm:h-48 sm:w-48" aria-hidden="true" /><p className="max-w-xs text-sm leading-6 text-[#53605a]">A calmer interface between your thoughts and the work that follows.</p><div className="mt-8 flex items-center gap-4 text-sm font-medium"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#17221d]/20 text-[#d67845]" aria-hidden="true">+</span><span>From request to resolution</span></div></div>
        </section>

        {!session ? (
          <section id="workspace" className="border-t border-[#17221d]/12 py-8 lg:py-12"><AuthPanel onAuthenticated={handleAuthenticated} /></section>
        ) : (
          <>
            <DashboardSummary intents={history} />
            <section id="workspace" className="grid gap-5 border-t border-[#17221d]/12 py-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12 lg:py-12"><div className="py-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">01 / Your workspace</p><h2 className="mt-4 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.04em]">Start with the thought, not the form.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-[#53605a]">Write naturally. IntentOS finds the signal, surfaces the details, and maps the next steps.</p></div><IntentInput value={text} loading={loading} error={error} onChange={(value) => { setText(value); setError(""); }} onSubmit={processIntent} onClear={clearWorkspace} /></section>
            {result && <IntentResult result={result} acting={actionLoading} actionError={actionError} onApprove={() => decide("approve")} onReject={() => decide("reject")} />}
            <HowItWorks />
            <IntentHistory intents={history} loading={historyLoading} error={historyError} selectedId={selectedHistoryId} onSelect={selectHistory} />
          </>
        )}

        <footer className="flex flex-col gap-3 border-t border-[#17221d]/12 py-6 text-xs text-[#8a948e] sm:flex-row sm:items-center sm:justify-between"><span>IntentOS / Make intent actionable.</span><span>Built for clearer next steps.</span></footer>
      </div>
    </main>
  );
}
