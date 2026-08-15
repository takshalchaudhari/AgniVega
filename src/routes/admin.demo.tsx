import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getAdminBoard } from "@/lib/data.functions";
import { setSystemMode } from "@/lib/admin.functions";
import { getAiStatus } from "@/lib/ai-status.functions";
import { resetDemoScenario, runDemoStep } from "@/lib/demo.functions";
import { DEMO_SCRIPT, DEMO_STEP_SECONDS, DEMO_TOTAL_SECONDS } from "@/lib/demo";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card, Progress, SectionTitle, Stat } from "@/components/ui-kit";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/demo")({
  head: () => ({
    meta: [
      { title: "Demo & system — Krishi-Yatra Control Tower" },
      {
        name: "description",
        content:
          "Run the deterministic 5-minute demo scenario and switch the platform between demo mode and real data mode.",
      },
      { property: "og:title", content: "Demo & system — Krishi-Yatra Control Tower" },
      { property: "og:description", content: "Scripted 5-minute demo run plus the global demo / real data switch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoControls,
});

const DEFAULT_LOGS: Log[] = DEMO_SCRIPT.map((s) => ({
  step: s.index,
  title: s.title,
  evidence: s.detail,
  at: "Active Sync",
}));

function DemoControls() {
  const board = useServerFn(getAdminBoard);
  const setMode = useServerFn(setSystemMode);
  const runStep = useServerFn(runDemoStep);
  const resetRun = useServerFn(resetDemoScenario);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["admin-board"], queryFn: () => board({}) });
  const aiProbe = useServerFn(getAiStatus);
  const aiStatus = useQuery({ queryKey: ["ai-status"], queryFn: () => aiProbe({}), staleTime: 60_000 });
  const ai = aiStatus.data;
  const [msg, setMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>(DEFAULT_LOGS);
  const [current, setCurrent] = useState(DEMO_SCRIPT.length - 1);
  const [running, setRunning] = useState(false);
  const cancel = useRef(false);
  const system = data?.system;

  useEffect(() => () => { cancel.current = true; }, []);

  async function change(mode: "real" | "demo", demoStatus?: "running" | "paused" | "stopped") {
    setMsg(null);
    try {
      await setMode({ data: demoStatus ? { mode, demoStatus } : { mode } });
      await qc.invalidateQueries({ queryKey: ["admin-board"] });
      setMsg(`Platform is now in ${mode === "demo" ? "demo" : "real data"} mode.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not change the mode");
    }
  }

  async function one(index: number) {
    const res = await runStep({ data: { step: index } });
    setCurrent(index);
    setLogs((l) => [
      ...l,
      { step: res.step, title: res.title, evidence: res.evidence, at: new Date().toLocaleTimeString() },
    ]);
    await qc.invalidateQueries({ queryKey: ["admin-board"] });
  }

  async function startRun() {
    setMsg(null);
    setLogs([]);
    setRunning(true);
    cancel.current = false;
    try {
      for (const step of DEMO_SCRIPT) {
        if (cancel.current) break;
        await one(step.index);
        if (step.index < DEMO_SCRIPT.length - 1) {
          await new Promise((r) => setTimeout(r, DEMO_STEP_SECONDS * 1000));
        }
      }
      if (!cancel.current) setMsg("5-minute demo scenario finished — every stage is recorded below.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Demo run failed");
    } finally {
      setRunning(false);
    }
  }

  async function fastRun() {
    setMsg(null);
    setLogs([]);
    setRunning(true);
    cancel.current = false;
    try {
      for (const step of DEMO_SCRIPT) {
        if (cancel.current) break;
        await one(step.index);
      }
      if (!cancel.current) setMsg("Fast run finished — same scenario, no waiting between stages.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Demo run failed");
    } finally {
      setRunning(false);
    }
  }

  async function reset() {
    cancel.current = true;
    setRunning(false);
    try {
      await resetRun({});
      setLogs([]);
      setCurrent(-1);
      await qc.invalidateQueries({ queryKey: ["admin-board"] });
      setMsg("Demo run records removed.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not reset");
    }
  }

  const done = current + 1;

  return (
    <AppShell
      role="admin"
      title="Demo & system"
      subtitle="Deterministic 5-minute scenario. Demo records stay separate from real records at the database level."
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Network Mode" value="Live Demo" emoji="⚡" sub="Deterministic Data" />
        <Stat label="Simulation Status" value={system?.demo_status ?? "Active"} emoji="▶️" />
        <Stat label="Stage Completed" value={`${done}/${DEMO_SCRIPT.length}`} emoji="⏱️" />
        <Stat label="Scenario Length" value={`${Math.round(DEMO_TOTAL_SECONDS / 60)} min`} emoji="🎬" />
      </div>

      <SectionTitle title="AI provider" hint="Sarvam AI is the primary model for Krishi Sathi and the demo summary." />
      <Card className="space-y-2">
        {aiStatus.isLoading ? (
          <p className="text-sm text-muted-foreground">Checking Sarvam AI…</p>
        ) : ai ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ai.primary.reachable ? "good" : ai.primary.configured ? "warn" : "muted"}>
                Primary · Sarvam {ai.primary.model}
              </Badge>
              <Badge tone={ai.primary.configured ? "good" : "warn"}>
                {ai.primary.configured ? "API key configured" : "API key missing"}
              </Badge>
              <Badge tone={ai.primary.reachable ? "good" : "warn"}>
                {ai.primary.reachable ? "Live probe passed" : "Live probe failed"}
              </Badge>
              <Badge tone="muted">Fallback · {ai.fallback.model}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{ai.primary.detail}</p>
            <p className="text-sm text-muted-foreground">
              Answers are currently served by <strong>{ai.active === "sarvam" ? "Sarvam AI" : ai.active === "fallback-ai" ? "the fallback model" : "the offline template"}</strong>.
            </p>
            <Button variant="ghost" onClick={() => void aiStatus.refetch()}>
              Re-check provider
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Provider status unavailable.</p>
        )}
      </Card>

      <SectionTitle title="Scripted demo run" hint="Farmer → crop → mandi → shipment → optimisation → trucks → driver → GPS → admin → buyer → order → delivery → AI" />

      <Card className="space-y-3">
        <Progress value={done / DEMO_SCRIPT.length} />
        <div className="flex flex-wrap gap-2">
          <Button disabled={running} onClick={fastRun} className="bg-primary text-primary-foreground font-semibold">
            {running ? "Populating Demo Network…" : "⚡ 1-Click Fast Run (All 14 Stages)"}
          </Button>
          <Button variant="soft" disabled={running} onClick={startRun}>
            {running ? "Demo running…" : "▶ Run 5-Min Timed Demo"}
          </Button>
          <Button
            variant="soft"
            disabled={running || current + 1 >= DEMO_SCRIPT.length}
            onClick={() => one(current + 1)}
          >
            Next stage
          </Button>
          <Button variant="ghost" disabled={running} onClick={reset}>
            Reset demo data
          </Button>
        </div>
        {msg ? <Badge tone="good">{msg}</Badge> : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2">
          <SectionTitle title="Scenario stages" />
          {DEMO_SCRIPT.map((s) => {
            const state = s.index < done ? "done" : s.index === done && running ? "active" : "todo";
            return (
              <div key={s.key} className="tint-panel flex items-start justify-between gap-3 p-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {s.index + 1}. {s.title}
                  </p>
                  <p className="text-muted-foreground">{s.detail}</p>
                  <p className="text-xs text-muted-foreground">{s.actor} · {s.screen}</p>
                </div>
                <Badge tone={state === "done" ? "good" : state === "active" ? "warn" : "neutral"}>
                  {state === "done" ? "done" : state === "active" ? "running" : "queued"}
                </Badge>
              </div>
            );
          })}
        </Card>

        <Card className="space-y-2">
          <SectionTitle title="Evidence log" hint="Written to the audit trail as demo records" />
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Click "⚡ 1-Click Fast Run" above to populate live demo records for all apps.</p>
          ) : (
            logs.map((l) => (
              <div key={`${l.step}-${l.at}`} className="tint-panel p-3 text-sm">
                <p className="font-semibold">
                  {l.step + 1}. {l.title} <span className="text-xs text-muted-foreground">{l.at}</span>
                </p>
                <p className="text-muted-foreground">{l.evidence}</p>
              </div>
            ))
          )}
        </Card>
      </div>

      <SectionTitle title="Network Simulation & Feed Controls" hint="Real-time synchronized data generation across all 5 applications" />
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => change("demo", "running")}>
            Resume Real-Time Telemetry Feed
          </Button>
          <Button variant="soft" onClick={() => change("demo", "paused")}>
            Pause Live Telemetry Stream
          </Button>
          <Button variant="ghost" onClick={reset}>
            Purge & Reset All Scenarios
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Every stage automatically generates and links records across all 5 roles: Farmer shipments, Driver trips & GPS telemetry, Fleet availability & maintenance, Buyer APMC marketplace orders, and Admin escrow settlements.
        </p>
      </Card>
    </AppShell>
  );
}
