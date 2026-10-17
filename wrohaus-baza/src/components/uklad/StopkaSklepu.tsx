import { getAbout } from "@/lib/serwer/oNas";
import { Footer } from "./Stopka";

export async function ShopFooter() {
  const about = await getAbout();
  return <Footer hideAbout={about.archived} />;
}
