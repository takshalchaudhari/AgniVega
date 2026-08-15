import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  tint,
}: {
  children: ReactNode;
  className?: string;
  tint?: boolean;
}) {
  return (
    <div className={cn(tint ? "tint-panel p-5" : "surface-card p-5", className)}>{children}</div>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  emoji,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  emoji?: string;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {emoji ? <span className="mr-1">{emoji}</span> : null}
        {label}
      </span>
      <span className="text-2xl font-semibold leading-tight">{value}</span>
      {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
    </Card>
  );
}

const toneMap: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/12 text-primary",
  accent: "bg-accent/20 text-accent-foreground",
  good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warn: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  bad: "bg-destructive/15 text-destructive",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneMap[tone] ?? toneMap["neutral"],
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    soft: "bg-surface-tint text-foreground border border-border hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  } as const;
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }}
        />
      </div>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="text-center">
      <p className="font-medium">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

const LiveMap = lazy(() => import("./live-map"));

type MapPointProp = { lat: number; lng: number; label?: string; details?: [string, string][] };
type MapVehicleProp = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  status?: string;
  details?: [string, string][];
};

/** Real OpenStreetMap map, client-only (SSR-safe placeholder). */
export function RouteMap({
  points = [],
  progress = 0,
  trip,
  vehicles = [],
  className,
}: {
  points?: MapPointProp[];
  progress?: number;
  trip?: { title?: string; details?: [string, string][] };
  vehicles?: MapVehicleProp[];
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (points.length < 2 && vehicles.length === 0) return null;
  const box = cn("h-56 w-full overflow-hidden rounded-2xl border border-border", className);
  if (!mounted) return <div className={cn(box, "bg-[var(--surface-tint)] animate-pulse")} />;
  return (
    <Suspense fallback={<div className={cn(box, "bg-[var(--surface-tint)] animate-pulse")} />}>
      <LiveMap
        points={points}
        progress={progress}
        trip={trip}
        vehicles={vehicles}
        className={box}
      />
    </Suspense>
  );
}


