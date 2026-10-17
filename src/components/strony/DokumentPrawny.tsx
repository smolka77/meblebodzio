interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function LegalDocument({
  updated,
  sections,
}: {
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <p className="section-kicker tracking-[0.12em] uppercase">
              Spis treści
            </p>
            <nav className="mt-4 space-y-2">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-sm text-sand transition-colors hover:text-charcoal"
                >
                  {i + 1}. {s.title}
                </a>
              ))}
            </nav>
            <p className="mt-8 text-xs leading-relaxed text-sand">
              Ostatnia aktualizacja: {updated}
            </p>
          </aside>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border-t border-taupe/30 pt-10 first:border-0 first:pt-0"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-3xl text-taupe">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-2xl text-charcoal md:text-3xl">
                    {section.title}
                  </h2>
                </div>
                <div className="prose-sofelio mt-6">{section.content}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function P({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-4 text-sm leading-[1.85] text-charcoal/80 last:mb-0">
      {children}
    </p>
  );
}

export function Ul({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-charcoal/80"
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sand" />
          {item}
        </li>
      ))}
    </ul>
  );
}
