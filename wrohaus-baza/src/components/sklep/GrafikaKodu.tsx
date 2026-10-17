export function CodeTicket({
  kicker,
  code,
  detail,
}: {
  kicker: string;
  code: string;
  detail?: string;
}) {
  return (
    <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl border border-dashed border-cream/40 bg-cream/[0.08]">
      <div className="flex items-stretch">
        <div className="flex w-16 shrink-0 items-center justify-center bg-terracotta text-[11px] font-semibold tracking-[0.16em] text-cream uppercase [writing-mode:vertical-rl]">
          {kicker}
        </div>
        <div className="flex-1 px-5 py-4 text-left">
          <p className="font-serif text-2xl tracking-[0.14em] text-cream uppercase">{code}</p>
          {detail ? <p className="mt-1 text-sm text-cream/75">{detail}</p> : null}
        </div>
      </div>
    </div>
  );
}
