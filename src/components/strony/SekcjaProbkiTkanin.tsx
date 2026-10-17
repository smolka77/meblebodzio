"use client";

import dynamic from "next/dynamic";
import type { Fabric } from "@/lib/typy";

function FabricSamplesPickerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-12">
      <div className="space-y-5">
        <div className="h-8 w-40 animate-pulse rounded-full bg-cream-light" />
        <div className="h-10 w-72 max-w-full animate-pulse rounded-lg bg-cream-light" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-taupe/20 bg-white"
          >
            <div className="aspect-[5/4] animate-pulse bg-cream-light" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
        <div className="h-6 w-40 animate-pulse rounded bg-cream-light" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-xl bg-cream-light/80" />
          ))}
        </div>
      </div>
    </div>
  );
}

const FabricSamplesClient = dynamic(
  () =>
    import("@/components/strony/ProbkiTkanin").then((mod) => mod.FabricSamplesClient),
  {
    ssr: false,
    loading: () => <FabricSamplesPickerSkeleton />,
  }
);

export function FabricSamplesSection({ fabrics }: { fabrics: Fabric[] }) {
  return <FabricSamplesClient fabrics={fabrics} />;
}
