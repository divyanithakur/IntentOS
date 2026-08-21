"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium text-blue-400">
            IntentOS
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Turn natural language into structured actions.
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Tell IntentOS what you want to accomplish. The system
            understands your request and converts it into a structured intent.
          </p>
        </div>

        {/* Input Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

          <label className="mb-3 block text-sm font-medium text-slate-300">
            What do you want to do?
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: Onboard Rahul as a Backend Engineer starting Monday"
            className="min-h-32 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <button
            onClick={processIntent}
            disabled={loading}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing..." : "Understand Intent"}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 space-y-6">

            {/* Intent */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-500">
                Intent Type
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-blue-400">
                {result.intent_type}
              </h2>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-500">
                Summary
              </p>

              <p className="mt-2 text-slate-200">
                {result.summary}
              </p>
            </div>

            {/* Entities */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="mb-4 text-sm text-slate-500">
                Entities
              </p>

              <div className="grid gap-4 sm:grid-cols-2">

                {Object.entries(result.entities || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl bg-slate-950 p-4"
                    >
                      <p className="text-xs uppercase text-slate-500">
                        {key}
                      </p>

                      <p className="mt-1 text-slate-200">
                        {String(value) || "Not provided"}
                      </p>
                    </div>
                  )
                )}

              </div>
            </div>

            {/* Actions */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="mb-4 text-sm text-slate-500">
                Planned Actions
              </p>

              <div className="space-y-3">

                {(result.actions || []).map(
                  (action: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl bg-slate-950 p-4"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm">
                        {index + 1}
                      </span>

                      <span className="text-slate-200">
                        {action}
                      </span>
                    </div>
                  )
                )}

              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}