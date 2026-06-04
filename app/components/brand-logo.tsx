import Image from "next/image";
import Link from "next/link";

const sizes = {
  sm: { box: 32, image: 32 },
  md: { box: 40, image: 40 },
  lg: { box: 56, image: 56 },
  xl: { box: 80, image: 80 },
  hero: { box: 112, image: 112 },
} as const;

export function BrandLogo({
  size = "md",
  showWordmark = true,
  href = "/",
  className = "",
}: {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  href?: string | null;
  className?: string;
}) {
  const { box, image } = sizes[size];

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="relative shrink-0 overflow-hidden rounded-[22%] shadow-[var(--shadow-md)] ring-1 ring-black/5"
        style={{ width: box, height: box }}
      >
        <Image
          src="/logo.png"
          alt=""
          width={image}
          height={image}
          className="h-full w-full object-cover"
          priority={size === "hero" || size === "lg"}
        />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
            InnerLeaf
          </span>
          <span className="mt-0.5 hidden text-[11px] font-medium text-[var(--foreground-subtle)] sm:block">
            Reflect with clarity
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="group transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
