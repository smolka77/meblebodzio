import { featured } from "@/data/projects";
import { BrowserFrame } from "@/components/previews";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-16">
      <div className="grid-mod pointer-events-none absolute inset-0" />
      <div className="relative flex min-h-[calc(100svh-4rem)] flex-col">
        <div className="flex flex-1 flex-col justify-end px-5 pb-8 sm:px-8 lg:px-10">
          <h1 className="mt-2 max-w-[100%] font-medium tracking-[-0.07em] text-ink leading-[0.82] text-[clamp(4.2rem,16vw,13rem)]">
            xt
            <span className="text-green">e</span>
            chart
          </h1>
        </div>

        <div className="grid border-t border-ink lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[280px] border-b border-ink lg:border-r lg:border-b-0">
            <Schematic />
          </div>
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-ink sm:border-r sm:border-b-0">
              <BrowserFrame project={featured[0]} compact />
            </div>
            <div className="bg-ink">
              <BrowserFrame project={featured[2]} compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Schematic() {
  return (
    <div className="relative flex h-full min-h-[280px] flex-col">
      <div className="flex h-9 items-center gap-1.5 bg-ink px-3">
        <span className="h-2 w-2 bg-green" />
        <span className="h-2 w-2 bg-gray-3" />
        <span className="h-2 w-2 bg-gray-2" />
        <span className="ml-auto h-1 w-28 bg-green" />
      </div>
      <div className="relative grid flex-1 grid-cols-3">
        <div className="bg-gray-1" />
        <div className="bg-gray-2" />
        <div className="bg-green" />
        <div className="absolute top-1/2 right-0 left-0 border-t border-dashed border-ink" />
      </div>
    </div>
  );
}
