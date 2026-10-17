import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import { Providers } from "@/components/Dostawcy";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { jsonLdOrganizacja, jsonLdWitryna, seo, seoZUstawien, siteOrigin } from "@/lib/seo";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { getVisibleProductCategories, getSettings } from "@/lib/serwer/ustawienia";
import { getCustomCategories } from "@/lib/serwer/kategorieWlasne";
import { getPayUInstallmentPublicConfig } from "@/lib/serwer/payuApi";
import { LOCALE_HTML } from "@/lib/jezyk";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteSeo = seoZUstawien(settings);
  return {
    metadataBase: new URL(siteOrigin),
    title: {
      default: siteSeo.title,
      template: `%s | ${seo.brand}`,
    },
    description: siteSeo.description,
    applicationName: seo.brand,
    keywords: siteSeo.keywords,
    authors: [{ name: seo.brand, url: siteOrigin }],
    creator: seo.brand,
    publisher: seo.brand,
    category: "shopping",
    classification: "Meble i wyposażenie domu, e-commerce",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, email: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: seo.locale,
      siteName: seo.brand,
      title: siteSeo.title,
      description: siteSeo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteSeo.title,
      description: siteSeo.description,
    },
    appleWebApp: {
      capable: true,
      title: seo.brand,
      statusBarStyle: "default",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const payuInstallments = getPayUInstallmentPublicConfig();
  const [locale, visibleProductCategories, settings, customCategories] = await Promise.all([
    getRequestLocale(),
    getVisibleProductCategories(),
    getSettings(),
    getCustomCategories(),
  ]);
  const sameAs = (settings.socialLinks ?? [])
    .map((link) => link.url?.trim())
    .filter(Boolean);
  const siteSeo = seoZUstawien(settings);
  return (
    <html
      lang={LOCALE_HTML[locale]}
      data-locale={locale}
      className={`${outfit.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-charcoal safe-x">
        <DaneStrukturalne
          dane={[
            jsonLdOrganizacja({
              phone: settings.phone,
              sameAs,
              description: siteSeo.description,
            }),
            jsonLdWitryna({ description: siteSeo.description }),
          ]}
        />
        <Providers
          locale={locale}
          visibleProductCategories={visibleProductCategories}
          customCategories={customCategories.filter((row) => row.visible)}
          payuInstallments={payuInstallments}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
