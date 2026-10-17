/** Plik weryfikacyjny Apple Pay z panelu PayU — treść to hex (Apple go dekoduje). */
export const APPLE_PAY_DOMAIN_ASSOCIATION =
  "7b2276657273696f6e223a312c227073704964223a2241433930334638433837364433373833463645443846443434423936303637434141323733373937313530353030323346343933444243384433363631343238222c22637265617465644f6e223a313738323231393732323730367d";

export function applePayAssociationResponse() {
  return new Response(APPLE_PAY_DOMAIN_ASSOCIATION, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}
