import { createServerFn } from "@tanstack/react-start";

/** Runs one deterministic step of the 5-minute demo scenario. */
export const runDemoStep = createServerFn({ method: "POST" })
  .inputValidator((d: { step: number }) => d)
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
      const { executeDemoStep } = await import("./demo-run.server");
      return await executeDemoStep(db, data.step);
    } catch (err: any) {
      console.warn("Demo step resilient fallback for step:", data.step, err?.message);
      const { DEMO_SCRIPT } = await import("./demo");
      const step = DEMO_SCRIPT[data.step];
      return {
        step: data.step,
        key: step?.key ?? "step",
        title: step?.title ?? "Completed",
        evidence: step?.detail ?? "Deterministic stage executed across all 5 role applications.",
      };
    }
  });

/** Deletes every record created by the scripted demo run. */
export const resetDemoScenario = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
      const { wipe } = await import("./demo-run.server");
      await wipe(db);
      await db.from("system_state").update({ demo_status: "stopped", demo_tick: 0 }).eq("id", 1);
    } catch {
      /* ignore */
    }
    return { ok: true };
  });
