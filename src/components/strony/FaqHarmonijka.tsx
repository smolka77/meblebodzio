"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqCategory } from "@/lib/typy";

export function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (categories.length === 0) {
    return (
      <p className="text-center text-sm text-sand">
        Brak pytań w FAQ. Wróć wkrótce lub skontaktuj się z nami.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <div key={category.id}>
          <h3 className="mb-6 font-serif text-2xl text-charcoal">
            {category.title}
          </h3>
          <div className="divide-y divide-taupe/30 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
            {category.items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-cream-light/50"
                  >
                    <span className="text-sm font-medium text-charcoal">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`mt-0.5 h-4 w-4 shrink-0 text-sand transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-[1.85] text-sand">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
