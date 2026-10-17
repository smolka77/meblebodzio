import { Suspense } from "react";
import Script from "next/script";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Koszyk",
  description: "Twój koszyk Wrohaus — dokończ zamówienie mebli i wyposażenia domu.",
  path: "/koszyk",
  noIndex: true,
});

export default function KoszykLayout({ children }: LayoutProps<"/koszyk">) {
  return (
    <>
      <Script
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
        strategy="beforeInteractive"
        crossOrigin="anonymous"
      />
      <Suspense fallback={<div className="py-16 text-center text-sand">Ładowanie koszyka…</div>}>
        {children}
      </Suspense>
    </>
  );
}
