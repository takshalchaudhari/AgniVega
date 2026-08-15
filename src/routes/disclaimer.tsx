import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui-kit";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Mandi Disclosures & Disclaimer — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Agri-market disclosures, APMC mandi pricing disclaimers, transit spoilage estimation notes, and intermediary terms for Smart Krishi-Yatra.",
      },
      { property: "og:title", content: "Mandi Disclosures & Disclaimer — Smart Krishi-Yatra" },
      { property: "og:url", content: "https://smartkrishiyatra.noxverse.in/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://smartkrishiyatra.noxverse.in/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
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
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Market Disclosures
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Mandi Disclosures & Disclaimer
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Platform: smartkrishiyatra.noxverse.in | Team Agnivega | Noxverse
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">1. APMC Mandi Price Fluctuations</h2>
            <p className="text-muted-foreground">
              Market rates displayed across the Smart Krishi-Yatra portal reflect indicative spot and modal prices compiled
              from APMC mandis (such as Pune, Nashik, Vashi Mumbai, Kolhapur, Nagpur, etc.) and agricultural price reporting feeds.
              Agricultural commodity prices are volatile and influenced by daily arrivals, moisture content, grading standards,
              and bidding auctions.
            </p>
            <p className="text-muted-foreground font-medium">
              Indicative prices serve as guidance; final realized auction bids at physical mandi yards are subject to buyer-seller
              concurrence and local APMC yard rules.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">2. Expected Net Realization (ENR) Model</h2>
            <p className="text-muted-foreground">
              The <strong>Expected Net Realization (ENR)</strong> computation provided by our engine uses scientific heuristics:
            </p>
            <div className="rounded-lg bg-muted p-3 font-mono text-xs">
              ENR = (Mandi Price × Net Weight) − Base Freight − Potential Detention Cost − Spoilage Risk Factor
            </div>
            <p className="text-muted-foreground">
              The spoilage risk model incorporates crop shelf-life, ambient temperature, transit duration, and humidity.
              While this model provides an empirical baseline to optimize market selection, extreme weather, road blockages,
              or unforeseen transit halts may affect actual spoilage outcomes.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">3. Intermediary Status & IT Act Section 79</h2>
            <p className="text-muted-foreground">
              Smart Krishi-Yatra functions as an electronic platform and digital logistics enabler under Section 79 of the
              Information Technology Act, 2000. We connect growers, logistics transporters, vehicle fleet managers, and buyers.
              The platform does not assume title to or ownership of agricultural commodities unless explicitly contracted in writing.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">4. No Financial or Commercial Guarantee</h2>
            <p className="text-muted-foreground">
              While Smart Krishi-Yatra strives for maximum algorithmic precision, we disclaim liability for any commercial losses
              arising directly from physical mandi auction disparities, force majeure events, natural disasters, or unannounced
              APMC market strikes.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
