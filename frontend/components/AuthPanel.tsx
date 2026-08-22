"use client";

import { FormEvent, useState } from "react";
import { IntentApiError, login, register, saveAuthSession } from "../lib/api";
import type { AuthSession } from "../types/intent";

type AuthPanelProps = {
  onAuthenticated: (session: AuthSession) => void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = mode === "login" ? await login(username, password) : await register(username, password);
      saveAuthSession(session);
      onAuthenticated(session);
    } catch (requestError) {
      if (requestError instanceof IntentApiError && requestError.kind === "network") {
        setError("IntentOS is unavailable right now. Start the backend and try again.");
      } else if (requestError instanceof IntentApiError && requestError.kind === "configuration") {
        setError("The backend URL is not configured. Add NEXT_PUBLIC_API_URL in Vercel and redeploy.");
      } else if (requestError instanceof IntentApiError && requestError.kind === "authentication") {
        setError(mode === "login" ? "Those credentials were not recognized." : "This account could not be created with those details.");
      } else {
        setError("We could not authenticate with those details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[1.25rem] border border-[#17221d]/15 bg-[#fffdf8] p-5 shadow-[0_20px_60px_rgba(23,34,29,0.08)] sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">Workspace access</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Sign in to your intent workspace.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#53605a]">Your requests and approvals belong to your account. Nothing is executed when you approve a plan.</p>
        </div>
        <span className="hidden text-2xl text-[#d67845] sm:block" aria-hidden="true">+</span>
      </div>
      <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-sm font-medium sm:col-span-1">Username<input className="mt-2 w-full rounded-lg border border-[#17221d]/15 bg-[#f4f1ea] p-3 outline-none focus:border-[#2e7d63]" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
        <label className="text-sm font-medium sm:col-span-1">Password<input className="mt-2 w-full rounded-lg border border-[#17221d]/15 bg-[#f4f1ea] p-3 outline-none focus:border-[#2e7d63]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <button className="text-left text-sm text-[#2e7d63] underline-offset-4 hover:underline" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}</button>
          <button className="rounded-lg bg-[#17221d] px-5 py-3 text-sm font-semibold text-[#fffdf8] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Checking access..." : mode === "login" ? "Sign in ->" : "Create account ->"}</button>
        </div>
        {error && <p className="text-sm text-[#b64b39] sm:col-span-2" role="alert">{error}</p>}
      </form>
    </div>
  );
}
