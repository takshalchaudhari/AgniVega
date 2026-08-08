import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Emblem } from "@/components/agnivega/Emblem";
import { ensureDemoAccount } from "@/lib/krishi/demo.functions";
import { DEMO_ACCOUNTS, setDemoMode } from "@/lib/demo/demo-mode";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  // Session state lives in browser storage, so rendering this page on the
  // server produces markup the client immediately contradicts.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Smart Krishi-Yatra AI" },
      {
        name: "description",
        content:
          "Sign in to Smart Krishi-Yatra AI to confirm pooled farm shipments, accept loads and manage your fleet.",
      },
      { property: "og:title", content: "Sign in — Smart Krishi-Yatra AI" },
      { property: "og:description", content: "Access the farmer, driver, fleet and admin portals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/farmer";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/farmer");
  const [demoBusy, setDemoBusy] = useState<string | null>(null);

  useEffect(() => {
    setNext(safeRedirect(new URLSearchParams(window.location.search).get("next")));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(next);
    });
  }, [next]);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: next as never });
  }

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${next}`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Check your email to confirm your account.");
      return;
    }
    navigate({ to: next as never });
  }

  async function demoLogin(account: (typeof DEMO_ACCOUNTS)[number]) {
    setDemoBusy(account.email);
    try {
      await ensureDemoAccount({ data: { email: account.email } });
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });
      if (error) throw new Error(error.message);
      setDemoMode(true);
      const target = account.role === "admin" ? "/admin" : `/${account.role}`;
      window.location.replace(target);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo sign-in failed");
    } finally {
      setDemoBusy(null);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next}`,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: next as never });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Emblem className="mx-auto h-14 w-14" />
          <CardTitle className="mt-3 text-2xl">Smart Krishi-Yatra AI</CardTitle>
          <CardDescription>Team Agnivega — agri-logistics operating system</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={google} variant="outline" className="mb-4 w-full">
            Continue with Google
          </Button>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-3 pt-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Sign in
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-3 pt-3">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} required onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password2">Password</Label>
                  <Input id="password2" type="password" value={password} required minLength={6} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-6 rounded-lg border border-dashed border-accent bg-accent/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Jury demo logins
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              One tap signs you in with seeded data. Password for all demo accounts:{" "}
              <code className="font-mono">Agnivega@2026</code>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  size="sm"
                  variant={account.role === "admin" ? "default" : "outline"}
                  disabled={demoBusy !== null}
                  onClick={() => demoLogin(account)}
                >
                  {demoBusy === account.email ? "Signing in…" : account.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}