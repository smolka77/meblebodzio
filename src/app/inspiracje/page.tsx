import Link from "next/link";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { KartaAranzacji } from "@/components/wnetrza/KartaAranzacji";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { LOOKS } from "@/lib/aranzacje";
import {
  PRODUCT_ROOMS,
  PRODUCT_STYLES,
  isProductRoom,
  isProductStyle,
} from "@/lib/stylePomieszczenia";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import * as I from "@/components/wzor/ikony";

export const metadata = stronaMeta({
  title: "Inspiracje i aranżacje wnętrz",
  description:
    "Gotowe aranżacje salonów i sypialni: skandynawskie, nowoczesne, loftowe i klasyczne. Kliknij mebel na zdjęciu albo kup cały zestaw z rabatem 10%.",
  path: "/inspiracje",
});

function chipClass(active: boolean) {
  return `grid h-10 shrink-0 place-items-center rounded-full border px-5 text-[14px] font-medium transition ${
    active ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
  }`;
}

function href(styl?: string, pokoj?: string) {
  const params = new URLSearchParams();
  if (styl) params.set("styl", styl);
  if (pokoj) params.set("pokoj", pokoj);
  const query = params.toString();
  return query ? `/inspiracje?${query}` : "/inspiracje";
}

export default async function InspirationsPage({
  searchParams,
}: PageProps<"/inspiracje">) {
  const query = await searchParams;
  const rawStyle = typeof query.styl === "string" ? query.styl : "";
  const rawRoom = typeof query.pokoj === "string" ? query.pokoj : "";
  const style = isProductStyle(rawStyle) ? rawStyle : undefined;
  const room = isProductRoom(rawRoom) ? rawRoom : undefined;

  const products = await getPublicProducts();
  const shown = LOOKS.filter(
    (look) => (!style || look.styles.includes(style)) && (!room || look.room === room)
  );
  const styles = PRODUCT_STYLES.filter((item) => LOOKS.some((look) => look.styles.includes(item.id)));
  const rooms = PRODUCT_ROOMS.filter((item) => LOOKS.some((look) => look.room === item.id));

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdOkuszki([
            { name: "Strona główna", path: "/" },
            { name: "Inspiracje", path: "/inspiracje" },
          ]),
        ]}
      />
      <Header />
      <main className="bg-white pb-16">
        <div className="pw pt-5">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Link href="/" className="hover:underline">
              Strona główna
            </Link>
            <I.Chevron className="h-3 w-3" />
            <span className="font-semibold">Inspiracje</span>
          </div>
          <h1 className="font-display mt-4 text-[32px] leading-tight tracking-[-0.035em] sm:text-[48px]">
            Inspiracje i aranżacje
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-meta">
            Każda aranżacja to prawdziwe meble z naszej oferty. Kliknij znacznik na zdjęciu, żeby
            zobaczyć produkt, albo kup cały zestaw z rabatem 10%.
          </p>

          <div className="no-scrollbar mt-7 flex gap-2.5 overflow-x-auto pb-1">
            <Link href={href(undefined, room)} className={chipClass(!style)}>
              Wszystkie style
            </Link>
            {styles.map((item) => (
              <Link
                key={item.id}
                href={href(style === item.id ? undefined : item.id, room)}
                className={chipClass(style === item.id)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
            <Link href={href(style, undefined)} className={chipClass(!room)}>
              Wszystkie pomieszczenia
            </Link>
            {rooms.map((item) => (
              <Link
                key={item.id}
                href={href(style, room === item.id ? undefined : item.id)}
                className={chipClass(room === item.id)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[17px]">Brak aranżacji w tym stylu i pomieszczeniu.</p>
              <Link href="/inspiracje" className="ulink mt-3 inline-block font-medium text-accent">
                Pokaż wszystkie inspiracje
              </Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {shown.map((look, index) => (
                <li key={look.slug} className={`h-[360px] sm:h-[420px] ${index === 0 && shown.length > 2 ? "lg:col-span-2" : ""}`}>
                  <KartaAranzacji look={look} products={products} size={index === 0 ? "lg" : "md"} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-md bg-paper p-7 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="font-display text-[24px] leading-tight sm:text-[30px]">
                Nie znalazłeś swojego stylu?
              </h2>
              <p className="mt-2 max-w-lg text-[15px] text-ink/80">
                Doradca dobierze meble do pomieszczenia, stylu i budżetu - w około minutę.
              </p>
            </div>
            <Link
              href="/doradca"
              className="grid h-12 shrink-0 place-items-center rounded-full bg-ink px-8 text-[15px] font-semibold text-white transition hover:bg-accent"
            >
              Dobierz meble
            </Link>
          </div>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
