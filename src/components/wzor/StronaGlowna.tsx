import type { BlogPost, Product } from "@/lib/typy";
import { LOOKS } from "@/lib/aranzacje";
import { KupCalyLook } from "@/components/wnetrza/KupCalyLook";
import { BandDoradcy } from "./BandDoradcy";
import { Bestsellery } from "./Bestsellery";
import { DlaCiebie } from "./DlaCiebie";
import { DlaczegoMy } from "./DlaczegoMy";
import { HeroGlowny } from "./HeroGlowny";
import { KafleKategorii } from "./KafleKategorii";
import { OpinieIUgc } from "./OpinieIUgc";
import { PoradnikiBlog } from "./PoradnikiBlog";
import { SekcjaInspiracji } from "./SekcjaInspiracji";
import { SekcjaKolekcji } from "./SekcjaKolekcji";

/** Aranżacje w poziomym kadrze - na stronie głównej każda ma znaczniki przy meblach. */
const HOME_LOOKS = LOOKS.filter((look) => look.ratio >= 1.2);

export function HomeView({
  products,
  posts,
  instagramUrl,
}: {
  products: Product[];
  posts: BlogPost[];
  instagramUrl?: string;
}) {
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }

  return (
    <>
      <HeroGlowny counts={counts} />
      <KafleKategorii counts={counts} />
      <Bestsellery products={products} />
      <DlaCiebie products={products} />
      <KupCalyLook looks={HOME_LOOKS} products={products} />
      <SekcjaKolekcji products={products} />
      <BandDoradcy />
      <OpinieIUgc products={products} instagramUrl={instagramUrl} />
      <DlaczegoMy />
      <SekcjaInspiracji products={products} />
      <PoradnikiBlog posts={posts} />
    </>
  );
}
