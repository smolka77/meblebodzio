"use client";

import { useMemo, useState } from "react";
import {
  categories,
  featured,
  projects,
  type Category,
  type Project,
} from "@/data/projects";
import { BrowserFrame } from "@/components/previews";

export function Work() {
  const [tab, setTab] = useState<"flagowe" | "portfolio">("flagowe");
  const [filter, setFilter] = useState<Category>("wszystkie");

  const archive = useMemo(
    () =>
      projects.filter(
        (project) => filter === "wszystkie" || project.category === filter,
      ),
    [filter],
  );

  return (
    <section id="prace" className="scroll-mt-16">
      <div className="flex flex-col gap-4 border-b border-ink px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <h2 className="text-sm font-medium tracking-tight">Prace</h2>
        <div role="tablist" aria-label="Portfolio" className="flex gap-8">
          <TabButton active={tab === "flagowe"} onClick={() => setTab("flagowe")}>
            Flagowe
          </TabButton>
          <TabButton
            active={tab === "portfolio"}
            onClick={() => setTab("portfolio")}
          >
            Portfolio
          </TabButton>
        </div>
      </div>

      {tab === "flagowe" ? (
        <div>
          {featured.map((project, index) => (
            <FeaturedRow key={project.id} project={project} index={index} />
          ))}
          <button
            type="button"
            onClick={() => setTab("portfolio")}
            className="flex w-full items-center justify-between border-b border-ink px-5 py-5 text-left hover:bg-green sm:px-8 lg:px-10"
          >
            <span className="text-sm">Pełne portfolio</span>
            <span className="font-mono text-xs text-gray-3">{projects.length}</span>
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink px-5 py-4 sm:px-8 lg:px-10">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`font-mono text-[11px] tracking-[0.16em] uppercase ${
                  filter === item.id ? "text-ink" : "text-gray-3 hover:text-ink"
                }`}
              >
                {filter === item.id ? "●" : "○"} {item.label}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((project) => (
              <article
                key={project.id}
                className="border-b border-ink p-4 sm:odd:border-r lg:[&:nth-child(3n)]:border-r-0 lg:border-r"
              >
                <BrowserFrame project={project} />
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium">{project.name}</h3>
                  <span className="font-mono text-[10px] text-gray-3">{project.year}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`font-mono text-[11px] tracking-[0.18em] uppercase ${
        active ? "text-ink" : "text-gray-3 hover:text-ink"
      }`}
    >
      {active ? "● " : ""}
      {children}
    </button>
  );
}

function FeaturedRow({ project, index }: { project: Project; index: number }) {
  const flip = index % 2 === 1;
  return (
    <article className="grid border-b border-ink lg:grid-cols-2">
      <div className={flip ? "lg:order-2" : ""}>
        <BrowserFrame project={project} />
      </div>
      <div
        className={`flex flex-col justify-between border-ink p-6 sm:p-8 ${
          flip ? "lg:order-1 lg:border-r" : "lg:border-l"
        }`}
      >
        <span className="font-mono text-[11px] text-gray-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="text-4xl font-medium tracking-tight sm:text-5xl">{project.name}</h3>
          <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-gray-3 uppercase">
            {project.year}
          </p>
        </div>
      </div>
    </article>
  );
}
