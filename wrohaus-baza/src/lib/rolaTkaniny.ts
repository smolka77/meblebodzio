import type { Fabric, FabricRole, ProductCategory } from "@/lib/typy";

export const FABRIC_ROLES: {
  id: FabricRole;
  label: string;
  hint: string;
}[] = [
  {
    id: "tkanina",
    label: "Tkanina tapicerska",
    hint: "Widoczna w katalogu próbek i przy meblach tapicerowanych.",
  },
  {
    id: "pokrowiec",
    label: "Pokrowiec materaca",
    hint: "Do ogłoszeń materacy — nie pokażemy jej w katalogu próbek.",
  },
  {
    id: "plyta",
    label: "Kolor mebla (szafa / płyta)",
    hint: "Do szaf, komód i szafek — nie pokażemy jej w katalogu próbek.",
  },
];

export function fabricRole(fabric: Pick<Fabric, "role">): FabricRole {
  return fabric.role === "pokrowiec" || fabric.role === "plyta"
    ? fabric.role
    : "tkanina";
}

export function isSampleCatalogFabric(fabric: Fabric): boolean {
  return fabric.active && fabricRole(fabric) === "tkanina";
}

const BOARD_CATEGORIES = new Set<ProductCategory>([
  "szafy",
  "szafki",
  "szafki-rtv",
  "komody",
]);

export function fabricRoleForCategory(category?: ProductCategory): FabricRole {
  if (category === "materace") return "pokrowiec";
  if (category && BOARD_CATEGORIES.has(category)) return "plyta";
  return "tkanina";
}

export function fabricsForProductPicker(
  fabrics: Fabric[],
  category?: ProductCategory
): Fabric[] {
  const wanted = fabricRoleForCategory(category);
  const matching = fabrics.filter((fabric) => fabricRole(fabric) === wanted);
  return matching.length ? matching : fabrics.filter((fabric) => fabricRole(fabric) === "tkanina");
}
