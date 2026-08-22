"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { HowItWorks } from "../components/HowItWorks";
import { IntentInput } from "../components/IntentInput";
import { IntentResult } from "../components/IntentResult";
import { createIntent } from "../lib/api";
import type { IntentResult as IntentResultData } from "../types/intent";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<IntentResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      console.error(err);
      setError("We could not reach IntentOS. Check that the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearWorkspace = () => {
    setText("");
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1ea] text-[#17221d]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Header />
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
            <p className="max-w-xs text-sm leading-6 text-[#53605a]">A calmer interface between your thoughts and the work that follows.</p>
            <div className="mt-8 flex items-center gap-4 text-sm font-medium">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#17221d]/20 text-[#d67845]" aria-hidden="true">+</span>
              <span>From request to resolution</span>
            </div>
          </div>
        </section>

        <section id="workspace" className="grid gap-5 border-t border-[#17221d]/12 py-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12 lg:py-12">
          <div className="py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">01 / Your workspace</p>
            <h2 className="mt-4 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.04em]">Start with the thought, not the form.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#53605a]">Write naturally. IntentOS finds the signal, surfaces the details, and maps the next steps.</p>
          </div>
          <IntentInput
            value={text}
            loading={loading}
            error={error}
            onChange={(value) => { setText(value); setError(""); }}
            onSubmit={processIntent}
            onClear={clearWorkspace}
          />
        </section>

        {result && <IntentResult result={result} />}
        <HowItWorks />

        <footer className="flex flex-col gap-3 border-t border-[#17221d]/12 py-6 text-xs text-[#8a948e] sm:flex-row sm:items-center sm:justify-between">
          <span>IntentOS / Make intent actionable.</span>
          <span>Built for clearer next steps.</span>
        </footer>
      </div>
    </main>
  );
}
