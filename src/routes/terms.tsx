import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui-kit";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Terms of Service governing the use of Smart Krishi-Yatra agri-logistics OS, capacity pooling, trip allocations, and marketplace transactions.",
      },
      { property: "og:title", content: "Terms of Service — Smart Krishi-Yatra" },
      { property: "og:url", content: "https://smartkrishiyatraa.noxverse.in/terms" },
    ],
    links: [{ rel: "canonical", href: "https://smartkrishiyatraa.noxverse.in/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <span>🌾</span>
            <span>Smart Krishi-Yatra</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/farmer" className="text-muted-foreground hover:text-primary">
              Farmer App
            </Link>
            <Link to="/auth" className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 text-center sm:text-left">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Legal & Compliance
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last Updated: August 15, 2026 | Effective Date: August 15, 2026 | Platform: smartkrishiyatraa.noxverse.in
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">1. Introduction & Acceptance</h2>
            <p className="text-muted-foreground">
              Welcome to <strong>Smart Krishi-Yatra</strong> (accessible via{" "}
              <a href="https://smartkrishiyatraa.noxverse.in" className="text-primary underline">
                smartkrishiyatraa.noxverse.in
              </a>
              ), an agri-logistics operating system developed and managed by Team Agnivega / Noxverse.
              By registering, accessing, or utilizing any of our five multi-tenant role modules (Farmer Portal,
              Driver In-Transit Console, Fleet Vehicle Manager, Mandi Buyer Desk, or Control Tower Operations), you
              agree to be bound by these Terms of Service.
            </p>
            <p className="text-muted-foreground">
              If you do not agree to these terms, you must discontinue the use of our services immediately.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">2. Regulatory Load Limits & Safety (12-Tonne Rule)</h2>
            <p className="text-muted-foreground">
              Under the Central Motor Vehicles Rules (CMVR) and state transport guidelines, vehicle safety is paramount.
              Smart Krishi-Yatra implements algorithmic hard guards:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong>Strict 12-Tonne Maximum:</strong> No individual dispatch order or aggregated pool exceeding
                12 tonnes (12,000 kg) payload shall be assigned to a single medium commercial vehicle.
              </li>
              <li>
                <strong>Automatic Load Splitting:</strong> When a harvest declaration exceeds 12 tonnes (e.g., an 18-tonne
                tomato batch), our capacity engine automatically partitions the consignment into compliant multi-truck
                allotments (e.g., 12 t + 6 t).
              </li>
              <li>
                <strong>Driver & Transporter Obligation:</strong> Drivers and fleet operators must not alter vehicle weight
                configurations beyond permitted legal axle limits.
              </li>
            </ul>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">3. User Roles & Account Responsibilities</h2>
            <p className="text-muted-foreground">
              The platform facilitates coordination among distinct ecosystem participants:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">👨‍🌾 Farmers</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accurately declare harvest weights, moisture levels, perishable timelines, and pickup coordinates.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">🚚 Drivers & Fleets</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maintain active GPS telemetry during scheduled trips, ensure valid licenses, fitness certificates, and transit insurance.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">🏪 Mandi Buyers & APMC Traders</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Perform fair weighment and electronic confirmation of arrival, honoring published procurement bids.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">🗼 Control Tower Administrators</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Audit exceptions, resolve SOS triggers, and monitor network health deterministically.
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">4. Expected Net Realization (ENR) & Marketplace Terms</h2>
            <p className="text-muted-foreground">
              Smart Krishi-Yatra calculates real-time Expected Net Realization (ENR = Mandi Gross Value - Freight Cost -
              Estimated Detention - Spoilage Risk). This computation is an analytical optimization tool designed to assist
              growers in choosing optimal mandis and pooling options.
            </p>
            <p className="text-muted-foreground">
              Final auction and electronic trade settlements occur in alignment with applicable APMC rules and statutory market fees.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">5. Payments, Escrow & Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Trip freight payments and produce payouts are settled upon verified delivery and digital POD (Proof of Delivery)
              acknowledgment. In case of load rejection, quality grade divergence, or transit delays due to mechanical breakdown,
              the incident is escalated to the Control Tower for rapid mediation within 24 hours.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">6. Governing Law & Jurisdiction</h2>
            <p className="text-muted-foreground">
              These terms are governed by and construed in accordance with the laws of the Republic of India, including the
              Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. Any disputes shall be
              subject to the exclusive jurisdiction of the competent courts in Maharashtra, India.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
