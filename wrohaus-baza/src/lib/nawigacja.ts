/** Bezpieczny wewnętrzny URL powrotu po logowaniu (bez open redirect). */
export function safeReturnPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/api")) return null;
  return trimmed;
}
