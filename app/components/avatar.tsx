"use client";

function initials(name?: string | null, email?: string | null) {
  const value = name || email?.split("@")[0] || "InnerLeaf";
  const letters = value
    .split(/\s|[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "IL";
}

export function Avatar({
  avatarUrl,
  displayName,
  email,
  isAdmin,
  size = "md",
  rounded = "full",
}: {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  isAdmin?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  rounded?: "full" | "xl" | "2xl";
}) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden bg-[var(--accent-soft)] font-semibold text-[var(--brand-teal-deep)]",
        isAdmin ? "ring-2 ring-[rgba(31,155,143,0.24)]" : "",
        rounded === "full" && "rounded-full",
        rounded === "xl" && "rounded-xl",
        rounded === "2xl" && "rounded-2xl",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-10 w-10 text-sm",
        size === "lg" && "h-12 w-12 text-sm",
        size === "xl" && "h-[52px] w-[52px] text-sm",
        size === "2xl" && "h-20 w-20 text-xl",
      ].join(" ")}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(displayName, email)
      )}
    </span>
  );
}
