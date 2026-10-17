export const COOKIE_CONSENT_KEY = "sofelio-cookie-consent";
export const COOKIE_CONSENT_EVENT = "sofelio-cookie-consent";
export const COOKIE_SETTINGS_EVENT = "sofelio-open-cookie-settings";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

function isConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.necessary === true && typeof v.analytics === "boolean";
}

function normalizeConsent(value: CookieConsent | Record<string, unknown>): CookieConsent {
  return {
    necessary: true,
    analytics: value.analytics === true,
    marketing: value.marketing === true,
    decidedAt:
      typeof value.decidedAt === "string" && value.decidedAt
        ? value.decidedAt
        : new Date().toISOString(),
  };
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isConsent(parsed) ? normalizeConsent(parsed) : null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(
  analytics: boolean,
  marketing = false
): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    marketing,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return readCookieConsent()?.marketing === true;
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
