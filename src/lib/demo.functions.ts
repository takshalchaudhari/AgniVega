import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Runs one deterministic step of the 5-minute demo scenario. Admin only. */
export const runDemoStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { step: number }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only an administrator can run the demo scenario");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { executeDemoStep } = await import("./demo-run.server");
    return executeDemoStep(db, data.step);
  });

/** Deletes every record created by the scripted demo run. Admin only. */
export const resetDemoScenario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only an administrator can reset the demo scenario");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { wipe } = await import("./demo-run.server");
    await wipe(db);
    await db.from("system_state").update({ demo_status: "stopped", demo_tick: 0 }).eq("id", 1);
    return { ok: true };
  });
