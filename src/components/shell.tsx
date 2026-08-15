import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ROLES, type Role } from "@/lib/roles";
import { LANGS, useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Assistant } from "@/components/assistant";
import { Footer } from "@/components/footer";

export function AppShell({
  role,
  title,
  subtitle,
  children,
  actions,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const meta = ROLES[role];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang, theme, toggleTheme, t } = useLang();
  const { user, signOut } = useAuth();

  return (
    <div data-role={role} className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="text-xl" aria-label="All apps">
            {meta.emoji}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{t(meta.app)}</p>
            <p className="truncate text-xs text-muted-foreground">{t(meta.tagline)}</p>
          </div>
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="h-9 max-w-28 rounded-lg border border-input bg-background px-2 text-xs"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("Theme")}
            title={theme === "dark" ? t("Light") : t("Dark")}
            className="h-9 w-9 shrink-0 rounded-lg border border-input text-sm"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          {user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden rounded-lg bg-primary/10 px-2 py-1.5 text-xs font-semibold text-primary sm:inline-block">
                👤 {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
              </span>
              <button
                onClick={() => signOut()}
                className="h-9 rounded-lg border border-input px-2.5 text-xs font-medium hover:bg-muted"
              >
                {t("Sign out")}
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              {t("Sign in")}
            </Link>
          )}
        </div>
        <nav className="mx-auto hidden max-w-6xl gap-1 px-3 pb-2 md:flex">
          {meta.nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === n.to
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t(n.label)}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions}
        </div>
        {children}
      </main>

      <Footer />

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-1.5">
          {meta.nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-[11px] font-medium ${
                pathname === n.to ? "bg-primary/12 text-primary" : "text-muted-foreground"
              }`}
            >
              {t(n.label)}
            </Link>
          ))}
        </div>
      </nav>

      <Assistant role={role} />
    </div>
  );
}
