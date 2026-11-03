import Link from "next/link";
import { ADVISOR_BAND } from "@/lib/glownaTresc";
import * as I from "./ikony";

export function BandDoradcy() {
  return (
    <section className="pw pt-16 lg:pt-24">
      <div className="relative overflow-hidden rounded-md bg-paper px-6 py-10 sm:px-12 sm:py-14 lg:px-16">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[14px] font-medium text-accent">
              <I.Sparkle className="h-4 w-4" />
              {ADVISOR_BAND.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-[28px] leading-[1.05] tracking-[-0.035em] sm:text-[38px]">
              {ADVISOR_BAND.title}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/80">{ADVISOR_BAND.text}</p>
          </div>
          <Link
            href={ADVISOR_BAND.cta.href}
            className="grid h-12 place-items-center rounded-full bg-ink px-8 text-[15px] font-semibold text-white transition hover:bg-accent"
          >
            {ADVISOR_BAND.cta.label}
          </Link>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 text-white/50 sm:h-96 sm:w-96"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <circle cx="100" cy="100" r="96" />
          <circle cx="100" cy="100" r="68" />
          <circle cx="100" cy="100" r="40" />
        </svg>
      </div>
    </section>
  );
}
