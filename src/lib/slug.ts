const POLISH: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
  Ą: "a",
  Ć: "c",
  Ę: "e",
  Ł: "l",
  Ń: "n",
  Ó: "o",
  Ś: "s",
  Ź: "z",
  Ż: "z",
};

function asciiSlug(text: string, max: number): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

/** Adres z polskich znaków: ł → l, ą → a, ż → z. Puste fragmenty znikają. */
export function slugify(text: string, max = 80): string {
  const mapped = text.trim().replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (ch) => POLISH[ch] ?? "");
  return asciiSlug(mapped, max);
}

/**
 * Poprawia stare slugi: „ł” wypadało (Łóżko → ozko, Regał → rega)
 * albo zostawia slug z nazwy po nowym slugify.
 */
export function intendedProductSlug(slug: string, name: string): string {
  const current = slug.trim();
  if (!current) return current;
  const good = slugify(name);
  const legacy = legacySlugify(name);
  if (good && current === legacy && good !== current) return good;
  if (current.startsWith("ozko-")) return `lozko-${current.slice(5)}`;
  if (current.startsWith("rega-") && /rega[łl]/i.test(name)) {
    return `regal-${current.slice(5)}`;
  }
  return current;
}

/**
 * Stary adres: „ł” wypadało z linku (Łóżko → ozko).
 * Służy tylko do rozpoznania starych slugów i przekierowania.
 */
export function legacySlugify(text: string, max = 80): string {
  return asciiSlug(text.trim(), max);
}
