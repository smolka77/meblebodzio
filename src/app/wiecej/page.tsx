import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { moreNavItems } from "@/lib/zasadySklepu";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Promocje, od ręki, do 7 dni, próbki",
  description:
    "Wyprzedaże, meble gotowe do wysyłki, meble do 7 dni i próbki tkanin — skróty do zakupów w Wrohaus.",
  path: "/wiecej",
});

export default function MorePage() {
  return (
    <PageShell
      eyebrow="Sklep"
      title="Więcej"
      description="Promocje, gotowe meble, meble do 7 dni i próbki tkanin — wszystko w jednym miejscu."
      path="/wiecej"
    >
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:gap-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {moreNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] transition-shadow hover:shadow-md"
            >
              <h2 className="font-serif text-2xl text-charcoal">{item.label}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-sand">
                {item.description}
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-[10px] tracking-[0.22em] text-charcoal uppercase transition-colors group-hover:text-sand">
                Przejdź
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
