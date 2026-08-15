import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Field, inputClass } from "@/components/ui-kit";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Sign in to Smart Krishi-Yatra to move harvests, run trips, manage fleets and buy produce.",
      },
      { property: "og:title", content: "Sign in — Smart Krishi-Yatra" },
      {
        property: "og:description",
        content: "One account for the farmer, driver, fleet, buyer and admin apps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        setMsg("Account created. If email confirmation is on, check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setMsg("Google sign-in failed. Try email instead.");
  }

  return (
    <div data-role="farmer" className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Smart Krishi-Yatra</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to continue" : "Create your account"}
        </p>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          {mode === "signup" ? (
            <Field label="Your name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          ) : null}
          <Field label="Email">
            <input
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password" hint="At least 6 characters">
            <input
              type="password"
              required
              minLength={6}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <Button variant="soft" className="mt-3 w-full" onClick={google}>
          Continue with Google
        </Button>

        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            ⚡ Quick Judge & Evaluator Access
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Skip sign-up to directly inspect deterministic live trips and operations.
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin/demo" })}
              className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              🚀 14-Stage Demo
            </button>
            <button
              type="button"
              onClick={() => void navigate({ to: "/admin" })}
              className="flex-1 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Control Tower
            </button>
          </div>
        </div>

        {msg ? <p className="mt-3 text-sm text-destructive">{msg}</p> : null}
        <button
          className="mt-4 w-full text-sm text-muted-foreground underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </Card>
    </div>
  );
}
