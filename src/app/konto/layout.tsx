import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Konto",
  description: "Twoje konto Wrohaus — zamówienia i zapisane konfiguracje.",
  path: "/konto",
  noIndex: true,
});

export default function KontoLayout({ children }: LayoutProps<"/konto">) {
  return children;
}
