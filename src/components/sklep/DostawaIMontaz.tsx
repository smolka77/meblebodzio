import Link from "next/link";
import type { AssemblyInfo } from "@/lib/atrybutyProduktu";
import { storePolicies } from "@/lib/zasadySklepu";
import * as I from "@/components/wzor/ikony";

/** Najważniejsze informacje o dostawie i montażu zaraz przy przycisku „Dodaj do koszyka”. */
export function DeliveryAssemblyPanel({
  deliveryLabel,
  costLabel,
  express,
  assembly,
  freeShipping,
}: {
  deliveryLabel: string;
  costLabel: string;
  express: boolean;
  assembly: AssemblyInfo;
  /** „Darmowa dostawa od 999 zł” - null, gdy darmowa dostawa jest wyłączona. */
  freeShipping?: string | null;
}) {
  const rows = [
    {
      icon: I.Truck,
      title: express ? "Wysyłka w 24 h" : "Przewidywana dostawa",
      text: deliveryLabel,
    },
    {
      icon: I.Home,
      title: `Dostawa ${costLabel}`,
      text: `${freeShipping ? `${freeShipping}. ` : ""}Kurier dowozi do pierwszych drzwi. Wniesienie do mieszkania nie jest wliczone.`,
    },
    {
      icon: I.Box,
      title: assembly.title,
      text: assembly.text,
    },
    {
      icon: I.Return,
      title: storePolicies.returnsLabel,
      text: `Odbiór osobisty z magazynu jest bezpłatny (${storePolicies.pickupHoursLabel}).`,
    },
  ];
  return (
    <div className="mt-5 rounded-xl border border-taupe/30 bg-white">
      <ul className="divide-y divide-taupe/25">
        {rows.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3.5 px-4 py-3.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage text-forest">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold text-charcoal">{title}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-charcoal/70">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/dostawa"
        className="block border-t border-taupe/25 px-4 py-3 text-[13px] font-medium text-charcoal underline decoration-taupe underline-offset-4 transition hover:decoration-charcoal"
      >
        Wszystkie informacje o dostawie i zwrotach
      </Link>
    </div>
  );
}
