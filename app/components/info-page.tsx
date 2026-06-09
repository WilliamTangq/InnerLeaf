"use client";

import { Card, PageHeader, PageShell, SectionLabel } from "./ui";

type InfoSection = readonly [string, string | readonly string[]];

export function InfoPage({
  eyebrow,
  title,
  purpose,
  sections,
}: {
  eyebrow: string;
  title: string;
  purpose: string;
  sections: readonly InfoSection[];
}) {
  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeader eyebrow={eyebrow} title={title}>
        {purpose}
      </PageHeader>

      <div className="grid gap-4">
        {sections.map(([heading, content]) => (
          <Card key={heading} className="hover:translate-y-0">
            <SectionLabel>{heading}</SectionLabel>
            {Array.isArray(content) ? (
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {content.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-teal)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
                {content}
              </p>
            )}
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
