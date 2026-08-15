import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 text-card-foreground backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <span className="font-bold tracking-tight text-foreground">Smart Krishi-Yatra</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Market-aware agri-logistics operating system for Indian farm-to-mandi supply chains.
              Optimizing crop transport, capacity pooling, and Expected Net Realization (ENR).
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Domain:{" "}
              <a
                href="https://smartkrishiyatra.noxverse.in"
                className="font-mono text-primary underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                smartkrishiyatra.noxverse.in
              </a>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Engineered by <span className="font-semibold text-foreground">Team Agnivega</span> · Noxverse
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Applications</h4>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/farmer" className="transition hover:text-primary">
                  🌱 Farmer Portal & Load Planner
                </Link>
              </li>
              <li>
                <Link to="/driver" className="transition hover:text-primary">
                  🚚 Driver & In-Transit Console
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="transition hover:text-primary">
                  🚛 Fleet & 12T Vehicle Manager
                </Link>
              </li>
              <li>
                <Link to="/buyer" className="transition hover:text-primary">
                  🏪 APMC Buyer & Mandi Desk
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition hover:text-primary">
                  🗼 Control Tower & Operations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Agri-Logistics Tech</h4>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">12-Tonne Capacity Guard</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Dynamic ENR Calculation</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Krishi Sathi (sarvam-105b AI)</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Live Telemetry & GPS Trails</span>
              </li>
              <li>
                <Link to="/admin/demo" className="text-primary hover:underline">
                  ⚡ 14-Stage Deterministic Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal & Compliance</h4>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/terms" className="transition hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-primary">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="transition hover:text-primary">
                  Mandi Disclosures & Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-primary">
                  Grievance & Statutory Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} Smart Krishi-Yatra (
            <a href="https://smartkrishiyatra.noxverse.in" className="text-primary hover:underline">
              smartkrishiyatra.noxverse.in
            </a>
            ). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>IT Act 2000 & DPDP 2023 Compliant</span>
            <span>•</span>
            <span>APMC Model Act Aligned</span>
            <span>•</span>
            <Link to="/auth" className="text-primary hover:underline">
              Secure Auth
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
