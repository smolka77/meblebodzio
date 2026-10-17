import type { MetadataRoute } from "next";
import { company } from "@/lib/firma";
import { seo } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${company.brandName} | meble i wyposażenie domu`,
    short_name: company.brandName,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f4",
    theme_color: "#111111",
    lang: "pl",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
