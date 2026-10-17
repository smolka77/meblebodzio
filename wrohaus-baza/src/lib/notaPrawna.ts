/** Domyślna nota prawna na karcie produktu — można ją edytować i wyłączyć. */
export const DEFAULT_PRODUCT_DISCLAIMER =
  "Wymiary mogą nieznacznie różnić się w zależności od ułożenia tkaniny. Kolory na zdjęciach poglądowych mogą delikatnie odbiegać od rzeczywistych ze względu na ustawienia ekranu.";

export function visibleProductDisclaimer(details?: {
  disclaimer?: string;
  showDisclaimer?: boolean;
}): string | null {
  const text = details?.disclaimer?.trim();
  if (!text) return null;
  const show = details?.showDisclaimer ?? true;
  return show ? text : null;
}
