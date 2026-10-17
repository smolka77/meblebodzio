import { company } from "@/lib/firma";
import { seo, siteOrigin } from "@/lib/seo";

export function GET() {
  const body = [
    `# ${company.brandName}`,
    "",
    seo.description,
    "",
    `Site: ${siteOrigin}`,
    `Contact: ${company.email}`,
    `Seller: ${company.legalName}, ${company.fullAddress}`,
    "",
    "Main sections:",
    `- Shop: ${siteOrigin}/produkty`,
    `- Categories: ${siteOrigin}/kategoria/narozniki`,
    `- Delivery: ${siteOrigin}/dostawa`,
    `- FAQ: ${siteOrigin}/faq`,
    `- Contact: ${siteOrigin}/kontakt`,
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
