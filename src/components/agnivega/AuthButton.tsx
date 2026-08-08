import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function useSupabaseUser() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return { email, ready };
}

export function AuthButton() {
  const { email, ready } = useSupabaseUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!ready) return <div className="h-9 w-24" aria-hidden />;

  if (!email) {
    return (
      <Button size="sm" variant="secondary" onClick={() => navigate({ to: "/auth" })}>
        Sign in
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          navigate({ to: "/auth", replace: true });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}