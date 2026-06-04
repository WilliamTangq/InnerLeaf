import { TrendingUp } from "lucide-react";
import { Card } from "./ui";

export type PatternItem = {
  value: string;
  count: number;
};

export function PatternSection({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: PatternItem[];
}) {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
              {description}
            </p>
          )}
        </div>
        <TrendingUp
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
        />
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">
          Not enough structured data yet.
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {items.map((item, index) => (
            <li
              key={item.value}
              className="flex items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
            >
              <span className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground-muted)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--surface)] text-xs font-medium text-[var(--foreground-subtle)]">
                  {index + 1}
                </span>
                <span className="flex-1">
                  {item.value}
                  <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                    <span
                      className="block h-full rounded-full bg-[var(--brand-teal)]/55"
                      style={{
                        width: `${Math.max(16, (item.count / maxCount) * 100)}%`,
                      }}
                    />
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-xs text-[var(--foreground-subtle)]">
                {item.count}×
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
