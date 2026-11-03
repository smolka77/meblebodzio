import Link from "next/link";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { WHY_US } from "@/lib/glownaTresc";

export function DlaczegoMy() {
  return (
    <section className="bg-forest py-16 text-white lg:py-24">
      <div className="pw">
        <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <StoreImage
                src={WHY_US.image}
                alt={WHY_US.imageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
            <div className="absolute -bottom-6 right-5 grid h-[116px] w-[116px] rotate-[-8deg] place-items-center rounded-full bg-accent text-center text-[14px] leading-tight font-medium text-white shadow-lg lg:-right-6">
              Projekt
              <br />i jakość
              <br />
              <b className="text-[15px]">z Polski</b>
            </div>
          </div>
          <div>
            <p className="text-[14px] font-medium text-sage">{WHY_US.eyebrow}</p>
            <h2 className="font-display mt-3 text-[30px] leading-[1.05] tracking-[-0.035em] sm:text-[40px]">
              {WHY_US.title}
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">{WHY_US.text}</p>
            <ul className="mt-9 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
              {WHY_US.items.map((item) => {
                return (
                  <li key={item.label} className="border-t border-white/20 pt-7">
                    <div className="text-[30px] leading-none font-semibold tracking-[-0.04em]">
                      {item.value}
                    </div>
                    <div className="mt-1.5 text-[14px] font-medium">{item.label}</div>
                    <div className="mt-0.5 text-[14px] text-white/65">{item.text}</div>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/o-nas"
              className="mt-10 inline-flex h-12 items-center rounded-full bg-white px-7 text-[15px] font-semibold text-forest transition hover:bg-paper"
            >
              Poznaj naszą historię
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
