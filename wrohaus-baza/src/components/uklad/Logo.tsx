import Link from "next/link";

type LogoProps = {
  className?: string;
  /** `dark` — jasna wersja na ciemnym tle (stopka) */
  variant?: "light" | "dark";
  compact?: boolean;
  href?: string;
};

export function Logo({
  className = "",
  variant = "light",
  compact = false,
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="Wrohaus"
    >
      <span
        className={`inline-flex items-start font-[family-name:var(--font-outfit)] leading-none font-black tracking-[-0.05em] ${
          variant === "dark" ? "text-cream" : "text-charcoal"
        } ${compact ? "text-[1.875rem] sm:text-[2.125rem]" : "text-[2.5rem]"}`}
      >
        wrohaus
        <span
          className="mt-[0.12em] ml-[0.12em] inline-block h-[0.22em] w-[0.22em] rounded-full bg-terracotta"
          aria-hidden
        />
      </span>
    </Link>
  );
}
