import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getMySession } from "./portal.functions";

/** Roles of the signed-in user; empty for guests. */
export function useMyRoles() {
  const sessionFn = useServerFn(getMySession);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setAuthed(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(Boolean(session)),
    );
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const query = useQuery({
    queryKey: ["my-roles"],
    queryFn: () => sessionFn({}),
    enabled: authed,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const roles = query.data?.roles ?? [];
  return { roles, isAdmin: roles.includes("admin"), ready: !authed || query.isFetched };
}
