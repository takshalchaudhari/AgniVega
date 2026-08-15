import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check client-side stored session for 1-click test logins
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("sky-demo-user");
      if (stored) {
        try {
          setDemoUser(JSON.parse(stored));
        } catch {
          window.localStorage.removeItem("sky-demo-user");
        }
      }
    }

    // 2. Listen to Supabase auth events
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
      }
    : demoUser;

  const setDemoSession = (role: string, name: string, email: string) => {
    const userObj: AuthUser = {
      id: `demo-${role}-${Date.now()}`,
      email,
      user_metadata: {
        role,
        full_name: name,
      },
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sky-demo-user", JSON.stringify(userObj));
    }
    setDemoUser(userObj);
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("sky-demo-user");
    }
    setDemoUser(null);
    await supabase.auth.signOut().catch(() => {});
  };

  return {
    session,
    user,
    loading,
    setDemoSession,
    signOut,
  };
}
