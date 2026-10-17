import type { ReactNode } from "react";

function Badge({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <li
      className={`flex h-9 items-center justify-center rounded-md border border-cream/20 bg-cream/[0.07] px-2.5 ${
        wide ? "min-w-[5.5rem]" : "min-w-[3.25rem]"
      }`}
      title={label}
    >
      <span className="sr-only">{label}</span>
      {children}
    </li>
  );
}

function BlikMark() {
  return (
    <svg viewBox="0 0 52 16" className="h-4 w-[52px]" aria-hidden>
      <text
        x="26"
        y="12.5"
        textAnchor="middle"
        fill="currentColor"
        className="text-cream"
        fontFamily="system-ui, sans-serif"
        fontSize="13"
        fontWeight="800"
        letterSpacing="0.04em"
      >
        BLIK
      </text>
    </svg>
  );
}

function CardMark() {
  return (
    <svg viewBox="0 0 40 16" className="h-4 w-10 text-cream" aria-hidden>
      <rect
        x="1"
        y="2"
        width="38"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="1" y="5" width="38" height="3" fill="currentColor" opacity="0.35" />
      <rect x="4" y="10.2" width="8" height="1.6" rx="0.4" fill="currentColor" />
    </svg>
  );
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 62 16" className="h-4 w-[62px] text-cream" aria-hidden>
      <path
        fill="currentColor"
        d="M8.6 3.4c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.2.8.1 1.6-.4 2.2-1.1Zm.1 1.2c-1.2 0-2.2.7-2.8.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.1 1.9-1.4 2.3-.3 5.8 1 7.7.6.9 1.4 2 2.4 2 .9 0 1.3-.6 2.4-.6s1.4.6 2.4.6 1.6-.9 2.3-1.9c.7-1.1 1-2.1 1-2.2 0 0-2-.8-2-3 0-1.9 1.5-2.8 1.6-2.9-.9-1.3-2.3-1.4-2.7-1.5-.6 0-1.1.1-1.6.1Z"
      />
      <text
        x="40"
        y="13"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize="12"
        fontWeight="600"
      >
        Pay
      </text>
    </svg>
  );
}

function BankMark() {
  return (
    <svg viewBox="0 0 56 16" className="h-4 w-14 text-cream" aria-hidden>
      <path
        fill="currentColor"
        d="M7 3.2 1.8 6h10.4L7 3.2Zm-4.6 3.6v6.4h1.5V7.4H2.4Zm2.6 0v6.4h1.6V7.4H5Zm2.7 0v6.4h1.5V7.4H7.7Zm2.6 0v6.4h1.6V7.4h-1.6ZM1.6 14.2V13h10.8v1.2H1.6Z"
      />
      <text
        x="38"
        y="12.5"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="0.06em"
      >
        BANK
      </text>
    </svg>
  );
}

export function PaymentMethodIcons({
  ariaLabel,
  blik,
  card,
  applePay,
  bank,
}: {
  ariaLabel: string;
  blik: string;
  card: string;
  applePay: string;
  bank: string;
}) {
  return (
    <ul
      className="flex flex-wrap items-center justify-center gap-2 md:justify-end"
      aria-label={ariaLabel}
    >
      <Badge label={blik}>
        <BlikMark />
      </Badge>
      <Badge label={card}>
        <CardMark />
      </Badge>
      <Badge label={applePay} wide>
        <ApplePayMark />
      </Badge>
      <Badge label={bank} wide>
        <BankMark />
      </Badge>
    </ul>
  );
}
