"use client";

import { useState } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setStatus("Add your public Supabase env vars to enable email sign-in.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Magic link sent. Check your inbox.");
  };

  return (
    <div className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-[1.3rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
      />
      <button
        type="button"
        onClick={() => {
          void handleSubmit();
        }}
        className="w-full rounded-[1.4rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)]"
      >
        Send magic link
      </button>
      {status ? <p className="text-sm text-[var(--text-soft)]">{status}</p> : null}
    </div>
  );
}
