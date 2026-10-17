/** Dane PayU S.A. — obowiązkowe na stronie sklepu (wymogi PayU + PSD2/RODO). */
export const payu = {
  legalName: "PayU S.A.",
  address: "ul. Grunwaldzka 186, 60-166 Poznań",
  krs: "0000274399",
  nip: "7792308495",
  shareCapital: "7 789 000 zł",
  court:
    "Sąd Rejonowy Poznań — Nowe Miasto i Wilda w Poznaniu, VIII Wydział Gospodarczy Krajowego Rejestru Sądowego",
  privacyUrl: "https://poland.payu.com/privacy-portal/privacy-statement/",
  termsUrl: "https://poland.payu.com/dokumenty-prawne-do-pobrania/",
  paymentTermsUrl:
    "https://poland.payu.com/wp-content/uploads/sites/14/2023/03/Regulamin-pojedynczej-transakcji-platniczej-PayU_LUTY2023.pdf",
  paymentOrderNotice:
    "Zlecenie realizacji płatności: Zlecenie wykonuje PayU SA; Dane odbiorcy, tytuł oraz kwota płatności dostarczane są PayU SA przez odbiorcę; Zlecenie jest przekazywane do realizacji po otrzymaniu przez PayU SA Państwa wpłaty. Płatność udostępniana jest odbiorcy w ciągu 1 godziny, nie później niż do końca następnego dnia roboczego; PayU SA nie pobiera opłaty od realizacji usługi.",
  paymentTermsNotice: "Płacąc akceptujesz Zasady płatności PayU.",
  privacyNotice:
    'Administratorem Twoich danych osobowych jest PayU S.A. z siedzibą w Poznaniu (60-166), przy ul. Grunwaldzkiej 186 ("PayU"). Twoje dane osobowe będą przetwarzane w celu realizacji transakcji płatniczej, powiadamiania Cię o statusie realizacji Twojej płatności, rozpatrywania reklamacji, a także w celu wypełnienia obowiązków prawnych ciążących na PayU.',
  privacyNoticeMore:
    "Masz prawo do dostępu, poprawiania, ograniczenia lub sprzeciwu wobec przetwarzania Twoich danych osobowych, a także prawo do przenoszenia danych i ich usunięcia. Podanie danych jest dobrowolne jednak niezbędne do realizacji płatności, a brak podania danych może skutkować odrzuceniem płatności.",
} as const;
