"use client";

import { openCookieSettings } from "@/lib/zgodaCookies";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function CookieSettingsButton({
  className,
}: {
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={`bg-transparent p-0 text-left ${className ?? ""}`}
    >
      {t("footer.cookieSettings")}
    </button>
  );
}
