import type { SocialLink, SocialPlatform } from "@/lib/typy";

export const SOCIAL_PLATFORMS: {
  value: SocialPlatform;
  label: string;
}[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "pinterest", label: "Pinterest" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "other", label: "Inne" },
];

const PLATFORM_LABELS = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.value, p.label])
) as Record<SocialPlatform, string>;

export function detectSocialPlatform(url: string): SocialPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com") || lower.includes("fb.com")) return "facebook";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("pinterest.")) return "pinterest";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "x";
  return "other";
}

export function socialLinkLabel(link: SocialLink): string {
  if (link.label?.trim()) return link.label.trim();
  return PLATFORM_LABELS[link.platform] ?? "Social media";
}

export function normalizeSocialLinks(
  links: SocialLink[] | undefined,
  legacyInstagramUrl?: string
): SocialLink[] {
  const sanitized = (links ?? [])
    .map((link, index) => ({
      id: link.id?.trim() || `social-${index + 1}`,
      url: link.url?.trim() ?? "",
      platform: link.platform ?? "other",
      label: link.label?.trim() || undefined,
    }))
    .filter((link) => link.url.length > 0);

  if (sanitized.length > 0) return sanitized;

  const legacy = legacyInstagramUrl?.trim();
  if (!legacy) return [];

  return [
    {
      id: "legacy-instagram",
      url: legacy,
      platform: "instagram",
    },
  ];
}

export function instagramUrlFromSocialLinks(links: SocialLink[]): string {
  return links.find((l) => l.platform === "instagram")?.url ?? "";
}
