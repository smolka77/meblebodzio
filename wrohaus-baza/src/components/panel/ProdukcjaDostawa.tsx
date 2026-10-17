"use client";

import { Truck, Zap } from "lucide-react";
import type { Product } from "@/lib/typy";
import { computeDeliverySchedule, PRODUCTION_TIME_SUGGESTIONS } from "@/lib/terminDostawy";
import { storePolicies } from "@/lib/zasadySklepu";
import {
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

type DeliveryFields = Pick<
  Product,
  | "productionTime"
  | "deliveryEstimate"
  | "deliveryCost"
  | "shipping24h"
  | "readyToShip"
  | "stockQty"
>;

export function ProductDeliveryField({
  value,
  onChange,
}: {
  value: DeliveryFields;
  onChange: (patch: Partial<DeliveryFields>) => void;
}) {
  const schedule = computeDeliverySchedule(value);
  const checkboxClass = "flex items-start gap-2 text-sm font-semibold text-charcoal";
  const hintClass = `mt-0.5 block ${panelMetaClass}`;

  return (
    <section className="rounded-2xl border border-taupe/25 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-charcoal">
          <Truck className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div>
          <p className={panelLabelClass}>Produkcja i dostawa</p>
          <p className={`mt-1 max-w-xl ${panelHintClass}`}>
            Ustawiane osobno dla produktu. Data dostawy liczy się sama (produkcja + transport).
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={checkboxClass}>
          <input
            type="checkbox"
            className="mt-0.5"
            checked={Boolean(value.shipping24h)}
            onChange={(e) => onChange({ shipping24h: e.target.checked })}
          />
          <span className="inline-flex flex-col">
            <span className="inline-flex items-center gap-1.5">
              Wysyłka 24H <Zap className="h-3.5 w-3.5 text-terracotta" />
            </span>
            <span className={hintClass}>
              Badge „WYSYŁKA 24H” na kafelku i karcie. Zamiast produkcji: „Wysyłka: do 24H”.
            </span>
          </span>
        </label>
      </div>

      {value.readyToShip ? (
        <p className={`mt-4 ${panelHintClass}`}>
          Ten produkt jest od ręki — czas produkcji nie obowiązuje. Ilość na magazynie
          ustawiasz przy kategorii.
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={panelLabelClass}>Termin produkcji</label>
          <input
            list="production-time-suggestions"
            value={value.productionTime ?? ""}
            onChange={(e) => onChange({ productionTime: e.target.value })}
            placeholder={`np. 7–10 dni roboczych (domyślnie ${storePolicies.productionTimeLabel})`}
            disabled={Boolean(value.shipping24h)}
            className={`${panelInputClass} disabled:opacity-50`}
          />
          <datalist id="production-time-suggestions">
            {PRODUCTION_TIME_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={panelLabelClass}>Przewidywana dostawa</label>
          <input
            value={value.deliveryEstimate ?? ""}
            onChange={(e) => onChange({ deliveryEstimate: e.target.value })}
            placeholder="puste = liczona automatycznie"
            className={panelInputClass}
          />
        </div>
        <div>
          <label className={panelLabelClass}>Koszt dostawy</label>
          <input
            value={value.deliveryCost ?? ""}
            onChange={(e) => onChange({ deliveryCost: e.target.value })}
            placeholder={`np. od 39 zł (domyślnie ${storePolicies.standardDeliveryPriceLabel})`}
            className={panelInputClass}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-taupe/50 bg-cream-light/60 px-4 py-3">
        <p className={panelMetaClass}>Tak zobaczy to klient:</p>
        <dl className="mt-1.5 grid gap-1 text-sm text-charcoal sm:grid-cols-3">
          <div>
            <dt className="text-charcoal/60">
              {schedule.express ? "Wysyłka" : "Termin produkcji"}
            </dt>
            <dd className="font-semibold">
              {schedule.express
                ? "do 24H"
                : schedule.productionLabel ?? "gotowy w magazynie"}
            </dd>
          </div>
          <div>
            <dt className="text-charcoal/60">Przewidywana dostawa</dt>
            <dd className="font-semibold">{schedule.deliveryLabel}</dd>
          </div>
          <div>
            <dt className="text-charcoal/60">Koszt dostawy</dt>
            <dd className="font-semibold">{schedule.deliveryCostLabel}</dd>
          </div>
          {value.readyToShip ? (
            <div>
              <dt className="text-charcoal/60">Na magazynie</dt>
              <dd className="font-semibold">
                {value.stockQty == null ? "podaj liczbę sztuk" : `${value.stockQty} szt.`}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
