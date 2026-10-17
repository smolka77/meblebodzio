import { cookies } from "next/headers";
import {
  LOCALE_COOKIE,
  parseLocale,
  translate,
  type Locale,
  type MessageKey,
  type TranslateVars,
} from "@/lib/jezyk";

export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getI18n() {
  const locale = await getRequestLocale();
  return {
    locale,
    t: (key: MessageKey, vars?: TranslateVars) =>
      translate(locale, key, vars),
  };
}
