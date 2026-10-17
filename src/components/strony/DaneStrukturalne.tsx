export function DaneStrukturalne({
  dane,
}: {
  dane: object | Array<object | null | undefined>;
}) {
  const payload = (Array.isArray(dane) ? dane : [dane]).filter(
    (item): item is object => Boolean(item)
  );
  if (payload.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          payload.length === 1 ? payload[0] : payload
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
