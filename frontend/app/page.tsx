"use client";

import { useState } from "react";

type IntentResult = {
  intent_type?: string;
  summary?: string;
  entities?: Record<string, unknown>;
  actions?: string[];
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<IntentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processIntent = async () => {
    if (!text.trim()) {
      setError("Please enter a request.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/intents/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the backend. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ea] text-[#17221d]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-[#17221d]/12 py-5">
          <a className="flex items-center gap-3" href="#top" aria-label="IntentOS home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17221d] text-sm font-bold text-[#f4f1ea]">I</span>
            <span className="text-lg font-semibold tracking-[-0.03em]">IntentOS</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-[#53605a] sm:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-[#17221d]" href="#how-it-works">How it works</a>
            <a className="transition-colors hover:text-[#17221d]" href="#workspace">Workspace</a>
          </nav>
          <a className="rounded-full border border-[#17221d]/20 px-4 py-2 text-sm font-medium transition-colors hover:border-[#17221d]" href="#workspace">
            Try it now <span aria-hidden="true">-&gt;</span>
          </a>
        </header>

        <section id="top" className="relative grid gap-12 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pb-28 lg:pt-24">
          <div className="relative z-10 animate-rise">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">
              <span className="h-2 w-2 rounded-full bg-[#d67845]" aria-hidden="true" />
              Intent intelligence for humans
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-7xl lg:text-[6.25rem]">
              Say what you mean. <span className="text-[#2e7d63]">Make it happen.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#53605a] sm:text-xl">
              IntentOS turns everyday requests into clear, structured plans your team can act on immediately.
            </p>
          </div>

          <div className="relative animate-rise-delay pb-2 lg:pb-6">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full border border-[#d67845]/40 sm:h-48 sm:w-48" aria-hidden="true" />
            <p className="max-w-xs text-sm leading-6 text-[#53605a]">
              A calmer interface between your thoughts and the work that follows.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm font-medium">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#17221d]/20 text-[#d67845]" aria-hidden="true">+</span>
              <span>From request to resolution</span>
            </div>
          </div>
        </section>

        <section id="workspace" className="grid gap-5 border-t border-[#17221d]/12 py-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12 lg:py-12">
          <div id="how-it-works" className="py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">01 / Your workspace</p>
            <h2 className="mt-4 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.04em]">Start with the thought, not the form.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#53605a]">Write naturally. IntentOS finds the signal, surfaces the details, and maps the next steps.</p>
          </div>

          <div className="rounded-[1.25rem] border border-[#17221d]/15 bg-[#fffdf8] p-5 shadow-[0_20px_60px_rgba(23,34,29,0.08)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <label className="text-sm font-semibold" htmlFor="intent-input">What are you trying to do?</label>
              <span className="text-xs text-[#8a948e]">Intent input</span>
            </div>
            <textarea
              id="intent-input"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Plan a trip to Pune this weekend"
              className="min-h-40 w-full resize-none rounded-lg border border-[#17221d]/15 bg-[#f4f1ea] p-5 text-lg leading-7 outline-none transition-colors placeholder:text-[#9aa29d] focus:border-[#2e7d63]"
              aria-describedby={error ? "intent-error" : undefined}
            />
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#8a948e]">Be as specific or as rough as you like.</p>
              <button
                onClick={processIntent}
                disabled={loading}
                className="rounded-lg bg-[#17221d] px-5 py-3 text-sm font-semibold text-[#fffdf8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Finding the signal..." : "Understand intent  ->"}
              </button>
            </div>
            {error && <p id="intent-error" className="mt-4 text-sm text-[#b64b39]" role="alert">{error}</p>}
          </div>
        </section>

        {result && (
          <section className="animate-rise border-t border-[#17221d]/12 py-12 lg:py-16" aria-live="polite">
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">02 / Structured response</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Here&apos;s what we heard.</h2>
              </div>
              <span className="text-sm text-[#8a948e]">Ready to refine</span>
            </div>
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.25rem] bg-[#2e7d63] p-6 text-[#fffdf8] sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c6e0d2]">Detected intent</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{result.intent_type || "Unclassified request"}</h3>
                <p className="mt-12 border-t border-[#fffdf8]/20 pt-4 text-sm leading-6 text-[#dcece4]">{result.summary || "We found a request ready to be turned into action."}</p>
              </div>
              <div className="rounded-[1.25rem] border border-[#17221d]/15 bg-[#fffdf8] p-6 sm:p-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a948e]">Details found</p>
                    <div className="mt-5 space-y-3">
                      {Object.entries(result.entities || {}).map(([key, value]) => (
                        <div key={key} className="border-b border-[#17221d]/10 pb-3">
                          <p className="text-xs capitalize text-[#8a948e]">{key.replaceAll("_", " ")}</p>
                          <p className="mt-1 text-sm font-medium">{String(value) || "Not provided"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a948e]">Action plan</p>
                    <ol className="mt-5 space-y-4">
                      {(result.actions || []).map((action, index) => (
                        <li key={`${action}-${index}`} className="flex gap-3 text-sm leading-5">
                          <span className="font-mono text-xs text-[#d67845]">{String(index + 1).padStart(2, "0")}</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="flex flex-col gap-3 border-t border-[#17221d]/12 py-6 text-xs text-[#8a948e] sm:flex-row sm:items-center sm:justify-between">
          <span>IntentOS / Make intent actionable.</span>
          <span>Built for clearer next steps.</span>
        </footer>
      </div>
    </main>
  );
}