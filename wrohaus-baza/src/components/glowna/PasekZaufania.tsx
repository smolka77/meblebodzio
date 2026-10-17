import { CreditCard, RotateCcw, Truck } from "lucide-react";
import { PolandMapIcon } from "@/components/ikony/IkonaMapyPolski";
import { storePolicies } from "@/lib/zasadySklepu";

const items = [
  { icon: CreditCard, label: "Płatności online" },
  { icon: RotateCcw, label: storePolicies.returnsLabel },
  { icon: PolandMapIcon, label: "Polska produkcja" },
  { icon: Truck, label: `Dostawa ${storePolicies.standardDeliveryPriceLabel}` },
];

export function TrustBar() {
  return (
    <section className="border-b border-taupe/30 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:grid-cols-4 lg:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2.5 text-center sm:gap-3"
          >
            <Icon className="h-6 w-6 text-charcoal sm:h-7 sm:w-7" strokeWidth={1.2} />
            <span className="max-w-[9rem] text-[11px] font-medium leading-snug tracking-[0.15em] text-charcoal uppercase sm:max-w-none sm:text-[10px] sm:tracking-[0.2em]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
