import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Button, Field, inputClass } from "@/components/ui-kit";
import { Footer } from "@/components/footer";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Statutory Grievance — Smart Krishi-Yatra" },
      {
        name: "description",
        content:
          "Official contact channels, technical support, and statutory grievance redressal officer information for Smart Krishi-Yatra (Noxverse).",
      },
      { property: "og:title", content: "Contact & Statutory Grievance — Smart Krishi-Yatra" },
      { property: "og:url", content: "https://smartkrishiyatra.noxverse.in/contact" },
    ],
    links: [{ rel: "canonical", href: "https://smartkrishiyatra.noxverse.in/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("farmer");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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
            Official Channels
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Contact & Grievance Redressal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get in touch with Team Agnivega / Noxverse or submit a formal support or grievance request.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Card className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">📍 Official Platform Address</h2>
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Smart Krishi-Yatra Platform Operations</p>
                <p>Team Agnivega · Noxverse India</p>
                <p>Maharashtra, India</p>
                <p className="mt-2">
                  <strong>Domain:</strong>{" "}
                  <a href="https://smartkrishiyatra.noxverse.in" className="text-primary underline">
                    smartkrishiyatra.noxverse.in
                  </a>
                </p>
              </div>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">🛡️ Statutory Grievance Officer</h2>
              <p className="text-xs text-muted-foreground">
                In compliance with Rule 3(2) of the Information Technology Rules, 2021 and Consumer Protection (E-Commerce) Rules, 2020:
              </p>
              <div className="rounded-lg bg-muted p-3 text-xs font-mono space-y-1">
                <p>Officer: Nodal Grievance Redressal Officer</p>
                <p>Email: grievance@noxverse.in</p>
                <p>Support: support@noxverse.in</p>
                <p>Response SLA: Within 48 business hours</p>
              </div>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">🚨 Emergency Transit SOS</h2>
              <p className="text-xs text-muted-foreground">
                Drivers encountering in-transit breakdowns or route emergencies can trigger the in-app SOS from the Driver Console or notify dispatch:
              </p>
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-medium">
                Emergency Dispatch: Available 24/7 in Driver App Console
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-base font-semibold text-foreground">Direct Support Inquiries</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Send a message to our operations desk. We respond promptly.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-xl bg-emerald-500/15 p-5 text-center text-emerald-700 dark:text-emerald-300">
                  <p className="text-2xl">✅</p>
                  <h3 className="mt-2 font-semibold">Message Received</h3>
                  <p className="mt-1 text-xs">
                    Thank you, {name}. Our support team at Noxverse will reach out to {email} shortly.
                  </p>
                  <Button variant="soft" className="mt-4 text-xs" onClick={() => setSubmitted(false)}>
                    Send another query
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <Field label="Your Name">
                    <input
                      className={inputClass}
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>

                  <Field label="Email / Phone">
                    <input
                      className={inputClass}
                      required
                      placeholder="your.name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field label="Role in Ecosystem">
                    <select
                      className={inputClass}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="farmer">Farmer / Grower</option>
                      <option value="driver">Driver / Transporter</option>
                      <option value="fleet">Fleet Owner</option>
                      <option value="buyer">Mandi Buyer / Trader</option>
                      <option value="other">General / Jury / Investor</option>
                    </select>
                  </Field>

                  <Field label="Message">
                    <textarea
                      required
                      rows={4}
                      className={inputClass}
                      placeholder="Describe your inquiry or grievance..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </Field>

                  <Button type="submit" className="w-full">
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
