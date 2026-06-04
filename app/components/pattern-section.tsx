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
  return (
    <Card>
      <h2 className="text-base font-semibold text-[var(--foreground)]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
          {description}
        </p>
      )}

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
                {item.value}
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
