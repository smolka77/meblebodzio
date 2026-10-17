import type { MetadataRoute } from "next";
import { company } from "@/lib/firma";

export default function robots(): MetadataRoute.Robots {
  const host = `https://${company.domain}`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/media", "/api/media/", "/uploads/"],
        disallow: ["/admin", "/admin/", "/konto", "/konto/", "/koszyk", "/koszyk/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/api/media", "/api/media/", "/uploads/"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
