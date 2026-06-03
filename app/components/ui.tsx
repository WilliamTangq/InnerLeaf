import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TopNav() {
  return (
    <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight text-[#24352B]"
      >
        InnerLeaf
      </Link>
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5F6F61]">
        <Link className="transition hover:text-[#38533D]" href="/history">
          History
        </Link>
        <Link className="transition hover:text-[#38533D]" href="/summary">
          Summary
        </Link>
        <Link className="transition hover:text-[#38533D]" href="/feedback">
          Feedback
        </Link>
      </nav>
    </header>
  );
}

export function PageShell({
  children,
  maxWidth = "max-w-3xl",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#24352B]">
      <TopNav />
      <div className={cx("mx-auto w-full px-5 pb-12 pt-6 sm:px-8", maxWidth)}>
        {children}
      </div>
    </main>
  );
}

export function PageHeader({
  eyebrow = "InnerLeaf",
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="mb-8">
      <p className="mb-3 text-sm font-medium tracking-wide text-[#6B7C6A]">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold leading-tight tracking-normal text-[#24352B] sm:text-4xl">
        {title}
      </h1>
      {children && (
        <div className="mt-4 max-w-2xl text-base leading-7 text-[#5F6F61]">
          {children}
        </div>
      )}
    </section>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-[28px] border border-[#E4DED2] bg-white/82 p-5 shadow-[0_18px_45px_rgba(68,59,43,0.07)] backdrop-blur sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "rounded-full bg-[#5F7F63] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#4F6E53] disabled:cursor-not-allowed disabled:opacity-55",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FA88B]",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex rounded-full px-5 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FA88B]",
        variant === "primary"
          ? "bg-[#5F7F63] text-white hover:bg-[#4F6E53]"
          : "border border-[#D8D2C4] text-[#5F7F63] hover:border-[#BFCAB8] hover:bg-white/65"
      )}
    >
      {children}
    </Link>
  );
}

export function TextareaField({
  label,
  helper,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#24352B]">
        {label}
      </span>
      {helper && (
        <span className="mt-1 block text-sm leading-6 text-[#6B7C6A]">
          {helper}
        </span>
      )}
      <textarea
        className={cx(
          "mt-3 w-full resize-none rounded-3xl border border-[#D8D2C4] bg-white/80 p-4 leading-7 text-[#35483B] outline-none transition placeholder:text-[#9A9A87] focus:border-[#8FA88B] focus:bg-white focus:ring-4 focus:ring-[#DDE8DA]",
          className
        )}
        {...props}
      />
    </label>
  );
}

export function StatusCard({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "warning" | "error" | "success";
}) {
  return (
    <Card
      className={cx(
        "text-sm leading-6",
        tone === "warning" && "border-[#E2D2AB] text-[#806328]",
        tone === "error" && "border-[#E4B8B1] text-[#9B4238]",
        tone === "success" && "border-[#C9D8C4] text-[#4F6E53]",
        tone === "neutral" && "text-[#5F6F61]"
      )}
    >
      {children}
    </Card>
  );
}

export function Disclaimer() {
  return (
    <p className="mt-8 text-sm leading-6 text-[#7A8377]">
      InnerLeaf is not therapy, diagnosis, or medical advice.
    </p>
  );
}
