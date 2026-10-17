import type { MessageKey } from "./jezyk/slownik";

export type ShopNavLink = {
  type: "link";
  labelKey: MessageKey;
  label: string;
  href: string;
};

export type ShopNavGroup = {
  type: "group";
  id: string;
  labelKey: MessageKey;
  label: string;
  children: ShopNavLink[];
};

export type ShopNavItem = ShopNavLink | ShopNavGroup;
export type CornerShape = "l" | "u";

export const CATEGORY_NAV_GROUPS = [
  { id: "lounge" as const, labelKey: "nav.lounge" as const, label: "Meble wypoczynkowe" },
  { id: "interior" as const, labelKey: "nav.interior" as const, label: "Meble do wnętrz" },
  { id: "bathroom" as const, labelKey: "nav.bathroom" as const, label: "Meble do łazienki" },
];

export function isCategoryNavGroupId(value: string): value is import("@/lib/typy").CategoryNavGroupId {
  return CATEGORY_NAV_GROUPS.some((group) => group.id === value);
}

export function withCustomCategoryNav(
  items: ShopNavItem[],
  custom: { slug: string; name: string; parentGroup: string; visible: boolean }[]
): ShopNavItem[] {
  return items.map((item) => {
    if (item.type !== "group") return item;
    const extra: ShopNavLink[] = custom
      .filter((row) => row.visible && row.parentGroup === item.id)
      .map((row) => ({
        type: "link" as const,
        labelKey: "nav.interior" as const,
        label: row.name,
        href: `/kategoria/${row.slug}`,
      }));
    if (extra.length === 0) return item;
    return { ...item, children: [...item.children, ...extra] };
  });
}

export const shopNavTree: ShopNavItem[] = [
  { type: "link", labelKey: "line.smart.title", label: "Smart", href: "/linia/smart" },
  {
    type: "link",
    labelKey: "line.comfort.title",
    label: "Comfort",
    href: "/linia/comfort",
  },
  {
    type: "link",
    labelKey: "line.premium.title",
    label: "Premium",
    href: "/linia/premium",
  },
  { type: "link", labelKey: "nav.lines", label: "Linie", href: "/linie" },
  {
    type: "group",
    id: "lounge",
    labelKey: "nav.lounge",
    label: "Meble wypoczynkowe",
    children: [
      {
        type: "link",
        labelKey: "nav.cornerL",
        label: "Narożniki L",
        href: "/kategoria/narozniki?ksztalt=l",
      },
      {
        type: "link",
        labelKey: "nav.cornerU",
        label: "Narożniki U",
        href: "/kategoria/narozniki?ksztalt=u",
      },
      { type: "link", labelKey: "cat.sofy", label: "Sofy", href: "/kategoria/sofy" },
    ],
  },
  {
    type: "group",
    id: "interior",
    labelKey: "nav.interior",
    label: "Meble do wnętrz",
    children: [
      { type: "link", labelKey: "cat.szafy", label: "Szafy", href: "/kategoria/szafy" },
      { type: "link", labelKey: "cat.komody", label: "Komody", href: "/kategoria/komody" },
      {
        type: "link",
        labelKey: "cat.szafki-rtv",
        label: "Szafki RTV",
        href: "/kategoria/szafki-rtv",
      },
      {
        type: "link",
        labelKey: "nav.nightstands",
        label: "Szafki nocne",
        href: "/kategoria/szafki",
      },
    ],
  },
  {
    type: "group",
    id: "bathroom",
    labelKey: "nav.bathroom",
    label: "Meble do łazienki",
    children: [],
  },
  { type: "link", labelKey: "nav.sale", label: "Promocje", href: "/promocje" },
  {
    type: "link",
    labelKey: "nav.ready",
    label: "Dostępne od ręki",
    href: "/meble-od-reki",
  },
  {
    type: "link",
    labelKey: "nav.sevenDays",
    label: "Meble do 7 dni",
    href: "/meble-do-7-dni",
  },
  {
    type: "link",
    labelKey: "nav.samples",
    label: "Próbki tkanin",
    href: "/probki-tkanin",
  },
];

export function flattenShopNav(items: ShopNavItem[] = shopNavTree): ShopNavLink[] {
  return items.flatMap((item) => (item.type === "link" ? [item] : item.children));
}

export function shopNavVisibleHrefs(items: ShopNavItem[] = shopNavTree): Set<string> {
  const hrefs = new Set<string>();
  for (const item of flattenShopNav(items)) {
    hrefs.add(item.href);
    hrefs.add(item.href.split("?")[0] ?? item.href);
  }
  return hrefs;
}

export function parseCornerShape(value: unknown): CornerShape | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "l" || raw === "u") return raw;
  return null;
}

function foldDiacritics(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function productMatchesCornerShape(
  product: { kind?: string; name?: string; description?: string },
  shape: CornerShape
): boolean {
  const text = foldDiacritics(
    `${product.kind ?? ""} ${product.name ?? ""} ${product.description ?? ""}`
  );
  const isU =
    /\bu[\s-]?kszta/.test(text) ||
    /\bnaroznik(?:i)?\s+u\b/.test(text) ||
    /\bksztalt(?:ny|ne|nego)?\s+u\b/.test(text);

  if (shape === "u") return isU;
  if (isU) return false;
  // Bez jawnego U narożnik idzie do L — typowy kształt, dopóki w karcie nie ma rodzaju U.
  return true;
}
