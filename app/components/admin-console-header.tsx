"use client";

import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./language-provider";
import { Badge, Card, LinkButton, PageActions } from "./ui";

const adminLinks = [
  { href: "/admin", key: "overview" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/feedback", key: "feedback" },
  { href: "/admin/system", key: "system" },
] as const;

export function AdminConsoleHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <section className="mb-8">
      <Card
        variant="elevated"
        className="overflow-hidden border-[rgba(31,92,70,0.2)] bg-[linear-gradient(135deg,rgba(250,255,240,0.92),rgba(255,255,248,0.86))] hover:translate-y-0"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(31,155,143,0.2)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
              <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="accent">{t.admin.title}</Badge>
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                  {t.admin.secureManagement}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                {t.admin.consoleTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)] sm:text-base">
                {t.admin.consoleBody}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <PageActions className="mb-0 mt-4">
        {adminLinks.map((link) => (
          <LinkButton
            key={link.href}
            href={link.href}
            size="sm"
            variant={pathname === link.href ? "primary" : "secondary"}
          >
            {t.admin[link.key]}
          </LinkButton>
        ))}
      </PageActions>
    </section>
  );
}
