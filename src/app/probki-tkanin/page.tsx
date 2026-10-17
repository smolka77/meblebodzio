import type { Metadata } from "next";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { FabricSamplesSection } from "@/components/strony/SekcjaProbkiTkanin";
import { extraListingIntros, extraListingLabels } from "@/lib/listingi";
import { getI18n } from "@/lib/jezyk/serwer";
import { localizeListingIntro } from "@/lib/jezyk/trescCms";
import { getFabrics } from "@/lib/serwer/tkaniny";
import { getSettings } from "@/lib/serwer/ustawienia";
import { isSampleCatalogFabric } from "@/lib/rolaTkaniny";
import { stronaMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SAMPLES_FALLBACK = extraListingIntros["probki-tkanin"];

export async function generateMetadata(): Promise<Metadata> {
  const [{ locale, t }, settings] = await Promise.all([getI18n(), getSettings()]);
  const description = await localizeListingIntro(
    settings.listingDescriptions?.["probki-tkanin"],
    SAMPLES_FALLBACK,
    locale
  );
  return stronaMeta({
    title: t("nav.samples") || extraListingLabels["probki-tkanin"],
    description,
    path: "/probki-tkanin",
  });
}

export default async function FabricSamplesPage() {
  const [{ locale, t }, fabrics, settings] = await Promise.all([
    getI18n(),
    getFabrics(true),
    getSettings(),
  ]);
  const catalog = fabrics.filter(isSampleCatalogFabric);
  const description = await localizeListingIntro(
    settings.listingDescriptions?.["probki-tkanin"],
    SAMPLES_FALLBACK,
    locale
  );

  return (
    <PageShell
      eyebrow="Materiały"
      title={t("nav.samples")}
      description={description}
      path="/probki-tkanin"
    >
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {catalog.length === 0 ? (
            <p className="text-center text-sm text-sand">
              Katalog tkanin jest w przygotowaniu. Wróć wkrótce lub napisz do nas.
            </p>
          ) : (
            <FabricSamplesSection fabrics={catalog} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
