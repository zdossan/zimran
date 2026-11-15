"use client";
// "Already subscribed? Restore access" — unlock a new phone or computer with the email you paid with.
// Step 1 asks the server to email a 6-digit code (only payers get one; everyone sees the same reply).
// Step 2 verifies the code with Supabase, which signs this browser in as that email, then asks the server to
// confirm the subscription with Stripe and unlock. This device's quiz answers are carried over.
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { getEntitlement } from "@/lib/supabase/entitlement";
import { loadSessionData, saveSessionData } from "@/lib/supabase/session";
import { buttonClass } from "@/components/brand/kit";
import { normalizeEmailShape } from "@/components/funnel/restoreEmail";

type Step = "email" | "code" | "done";
const FIELD =
  "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100";
const UNAVAILABLE = "Restoring access isn't available right now.";

export function RestoreAccess({ onRestored = () => window.location.reload() }: { onRestored?: () => void }) {
  // Shown only once we know this browser hasn't paid (no flash of "Restore access" for payers).
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    getEntitlement()
      .then((e) => live && setShow(!e.pro))
      .catch(() => live && setShow(true));
    return () => {
      live = false;
    };
  }, []);

  if (!show) return null;

  async function sendCode() {
    const clean = normalizeEmailShape(email);
    if (!clean) return setError("Enter the email you paid with.");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/restore/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: clean }) });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; configured?: boolean } | null;
      if (body?.configured === false) setError(UNAVAILABLE);
      else if (res.ok && body?.ok) {
        setEmail(clean);
        setStep("code");
      } else setError("Something went wrong. Please try again.");
    } catch {
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!/^\d{6}$/.test(code.trim())) return setError("Enter the 6-digit code from the email.");
    const supabase = getBrowserClient();
    if (!supabase) return setError(UNAVAILABLE);
    setError("");
    setBusy(true);
    try {
      // Read this device's answers before the code signs the browser in as a different user.
      const answers = await loadSessionData<unknown>("borrowerInput").catch(() => null);
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
      if (otpError) return setError("That code didn't work or has expired. Check it, or send a new one.");
      if (answers) await saveSessionData("borrowerInput", answers).catch(() => undefined);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/restore/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const body = (await res.json().catch(() => null)) as { pro?: boolean; error?: string; configured?: boolean } | null;
      if (res.ok && body?.pro) {
        setStep("done");
        onRestored();
      } else if (body?.error === "no_active_subscription") setError("We couldn't find an active subscription for that email.");
      else if (body?.configured === false) setError(UNAVAILABLE);
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Restore access" className="rounded-2xl border border-slate-200 bg-white p-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? "restore-access-panel" : undefined}
        onClick={() => setOpen((o) => !o)}
        className="min-h-11 text-left text-base font-semibold text-brand-800 underline-offset-4 hover:underline"
      >
        Already subscribed? Restore access
      </button>
      {open ? (
        <div id="restore-access-panel" className="mt-3 space-y-3">
          {step === "email" ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void sendCode();
              }}
            >
              <p className="text-sm text-slate-600">On a new phone or computer? Enter the email you paid with and we&apos;ll send you a code.</p>
              <label htmlFor="restore-email" className="mt-3 block text-sm font-semibold text-slate-900">
                Email you paid with
              </label>
              <input id="restore-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} />
              <button type="submit" disabled={busy} className={buttonClass("secondary", "mt-3 w-full sm:w-auto")}>
                Send code
              </button>
            </form>
          ) : null}

          {step === "code" ? (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void restore();
              }}
            >
              <p className="text-sm text-slate-700">
                If {email} has an active subscription, we&apos;ve sent a 6-digit code to it. Check your inbox and spam folder.
              </p>
              <label htmlFor="restore-code" className="mt-3 block text-sm font-semibold text-slate-900">
                6-digit code
              </label>
              <input
                id="restore-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${FIELD} tracking-[0.3em]`}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={busy} className={buttonClass("primary")}>
                  Restore access
                </button>
                <button
                  type="button"
                  className="min-h-11 text-sm font-medium text-brand-800 underline underline-offset-4"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                >
                  Use a different email
                </button>
              </div>
            </form>
          ) : null}

          {step === "done" ? (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
              Access restored.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
