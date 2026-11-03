import Link from "next/link";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { DoradcaZakupowy } from "@/components/sklep/DoradcaZakupowy";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import * as I from "@/components/wzor/ikony";

export const metadata = stronaMeta({
  title: "Doradca zakupowy - dobierz meble",
  description:
    "Odpowiedz na pięć pytań o pomieszczenie, styl i budżet - dobierzemy meble i podpowiemy, czym je uzupełnić.",
  path: "/doradca",
});

export default async function AdvisorPage() {
  const products = await getPublicProducts();
  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdOkuszki([
            { name: "Strona główna", path: "/" },
            { name: "Doradca zakupowy", path: "/doradca" },
          ]),
        ]}
      />
      <Header />
      <main className="bg-white pb-20">
        <div className="pw pt-5">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Link href="/" className="hover:underline">
              Strona główna
            </Link>
            <I.Chevron className="h-3 w-3" />
            <span className="font-semibold">Doradca zakupowy</span>
          </div>
          <div className="mt-6 max-w-3xl">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-accent">
              <I.Sparkle className="h-4 w-4" />
              Doradca zakupowy
            </p>
            <h1 className="font-display mt-2 text-[34px] leading-[1.05] tracking-[-0.035em] sm:text-[52px]">
              Dobierzemy meble do Twojego wnętrza
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-meta">
              Pięć krótkich pytań. Na końcu dostaniesz listę modeli z uzasadnieniem i podpowiedź,
              czym je uzupełnić. Nic nie zapisujemy - to działa w Twojej przeglądarce.
            </p>
          </div>
          <div className="mt-10 max-w-5xl">
            <DoradcaZakupowy products={products} />
          </div>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
