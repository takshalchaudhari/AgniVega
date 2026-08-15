import { createServerFn } from "@tanstack/react-start";

/** Runs one deterministic step of the 5-minute demo scenario. */
export const runDemoStep = createServerFn({ method: "POST" })
  .inputValidator((d: { step: number }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { executeDemoStep } = await import("./demo-run.server");
    return executeDemoStep(db, data.step);
  });

/** Deletes every record created by the scripted demo run. */
export const resetDemoScenario = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { wipe } = await import("./demo-run.server");
    await wipe(db);
    await db.from("system_state").update({ demo_status: "stopped", demo_tick: 0 }).eq("id", 1);
    return { ok: true };
  });
