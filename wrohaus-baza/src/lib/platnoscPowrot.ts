/** PayU dopina te parametry, gdy klient anuluje albo płatność nie przejdzie. */
export function payuReturnLooksFailed(params: {
  get(name: string): string | null;
}): boolean {
  if (params.get("przerwane") === "1") return true;

  const error =
    params.get("error") ||
    params.get("errorCode") ||
    params.get("errorMsg") ||
    params.get("error_code");
  if (error && error !== "0") return true;

  const status = (params.get("status") || "").toLowerCase();
  if (status === "failed" || status === "canceled" || status === "cancelled") {
    return true;
  }

  const statusCode = (params.get("statusCode") || "").toUpperCase();
  return (
    statusCode.includes("ERROR") ||
    statusCode === "CANCELED" ||
    statusCode === "CANCELLED"
  );
}
