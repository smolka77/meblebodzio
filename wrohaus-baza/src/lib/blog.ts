export function formatBlogDate(date: string): string {
  return new Date(date).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type { BlogPost } from "@/lib/typy";
