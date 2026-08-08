import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEMO_PASSWORD = "Agnivega@2026";

const DEMO_USERS = [
  { email: "admin@agnivega.demo", role: "admin", name: "Demo Admin" },
  { email: "farmer@agnivega.demo", role: "farmer", name: "Demo Farmer" },
  { email: "driver@agnivega.demo", role: "driver", name: "Demo Driver" },
  { email: "fleet@agnivega.demo", role: "fleet", name: "Demo Fleet Operator" },
] as const;

/**
 * Provisions the four fixed demo logins used for jury walkthroughs. Only the
 * hardcoded @agnivega.demo addresses can ever be created here, and the call is
 * idempotent.
 */
export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ email: z.enum(DEMO_USERS.map((u) => u.email) as [string, ...string[]]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const spec = DEMO_USERS.find((u) => u.email === data.email)!;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: spec.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: spec.name, role: spec.role, language: "en" },
    });

    let userId = created?.user?.id ?? null;
    if (error && !/already/i.test(error.message)) throw new Error(error.message);
    if (!userId) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      userId = list?.users.find((u) => u.email === spec.email)?.id ?? null;
      if (userId) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: DEMO_PASSWORD,
          email_confirm: true,
        });
      }
    }
    if (!userId) throw new Error("Could not provision the demo account");

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: spec.role }, { onConflict: "user_id,role" });

    return { email: spec.email, password: DEMO_PASSWORD, role: spec.role };
  });
