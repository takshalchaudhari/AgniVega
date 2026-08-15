import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui-kit";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Privacy Policy and DPDP Act 2023 compliance disclosures for Smart Krishi-Yatra agri-logistics operating system.",
      },
      { property: "og:title", content: "Privacy Policy — Smart Krishi-Yatra" },
      { property: "og:url", content: "https://smartkrishiyatraa.noxverse.in/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://smartkrishiyatraa.noxverse.in/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            DPDP Act 2023 Compliant
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: August 15, 2026 | Domain: smartkrishiyatraa.noxverse.in | Organization: Noxverse
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">1. Commitment to Data Privacy</h2>
            <p className="text-muted-foreground">
              <strong>Smart Krishi-Yatra</strong> is committed to safeguarding the privacy and personal data of our
              agricultural community, including growers, freight operators, drivers, and mandi traders. We adhere strictly
              to the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em> and the <em>Information Technology
              (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <strong className="text-foreground">A. Identification & Account Data:</strong> Name, verified mobile number,
                email address, role selection (Farmer, Driver, Fleet, Buyer, Admin).
              </div>
              <div>
                <strong className="text-foreground">B. Agricultural & Logistics Data:</strong> Harvest produce type, estimated
                weight/tonnage, moisture content, perishability index, farm pickup address, target APMC mandi.
              </div>
              <div>
                <strong className="text-foreground">C. Geolocation & Telemetry:</strong> Precise live GPS tracking coordinates
                emitted during active trips by driver mobile devices and fleet onboard units to provide in-transit safety,
                route compliance, and estimated arrival calculation.
              </div>
              <div>
                <strong className="text-foreground">D. Financial & Transactional Data:</strong> Encrypted bank/UPI handles
                strictly for escrow payout disbursement and freight clearance.
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">3. Row-Level Security (RLS) & Technical Protections</h2>
            <p className="text-muted-foreground">
              Our PostgreSQL architecture enforces granular <strong>Row-Level Security (RLS)</strong> policies across all 24
              database tables. This ensures:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Farmers can only access their specific crop declarations, bookings, and payout records.</li>
              <li>Drivers only view trips and contact details directly assigned to their verified vehicle.</li>
              <li>Mandi buyers can only review order tenders they have placed or won.</li>
              <li>Direct unauthenticated access to system tables returns HTTP 401 Unauthorized by default.</li>
            </ul>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">4. AI & Voice Assistant Privacy (Krishi Sathi)</h2>
            <p className="text-muted-foreground">
              Our trilingual conversational assistant (Krishi Sathi powered by Sarvam AI / Sarvam-105b) operates strictly on
              role-grounded facts retrieved from your active authenticated context. <strong>No voice audio or personal identifiers
              are stored for external model training.</strong> Queries are processed ephemerally solely to return localized advice
              in English, Hindi (हिंदी), and Marathi (मराठी).
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">5. Data Subject Rights & Grievance Redressal</h2>
            <p className="text-muted-foreground">
              In accordance with the DPDP Act 2023, you retain the right to review, update, or request the deletion of your personal
              information at any time. For privacy inquiries or grievance redressal, contact our designated Data Protection Officer at:
            </p>
            <div className="rounded-lg bg-muted p-3 font-mono text-xs">
              <p>Grievance Officer: Data Protection Desk</p>
              <p>Email: grievance@noxverse.in / support@noxverse.in</p>
              <p>Portal: https://smartkrishiyatraa.noxverse.in/contact</p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
