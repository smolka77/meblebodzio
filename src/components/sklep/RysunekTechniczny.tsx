import type { ProductDimsCm } from "@/lib/atrybutyProduktu";

const INK = "#1c1916";
const MUTED = "#6e665e";
const FILL = "#f3efe8";

const PANEL_W = 270;
const TOP = 58;
const MAX_W = 150;
const MAX_H = 165;

function fmt(value: number): string {
  return `${String(value).replace(".", ",")} cm`;
}

function HorizontalDim({ x, y, width, text }: { x: number; y: number; width: number; text: string }) {
  const line = y + 20;
  return (
    <g stroke={MUTED} strokeWidth={1}>
      <line x1={x} y1={y + 6} x2={x} y2={line + 5} />
      <line x1={x + width} y1={y + 6} x2={x + width} y2={line + 5} />
      <line x1={x} y1={line} x2={x + width} y2={line} />
      <line x1={x} y1={line - 4} x2={x + 6} y2={line + 4} />
      <line x1={x + width} y1={line - 4} x2={x + width - 6} y2={line + 4} />
      <text x={x + width / 2} y={line + 22} textAnchor="middle" fill={INK} stroke="none" fontSize={16} fontWeight={600}>
        {text}
      </text>
    </g>
  );
}

function VerticalDim({ x, y, height, text }: { x: number; y: number; height: number; text: string }) {
  const line = x + 20;
  return (
    <g stroke={MUTED} strokeWidth={1}>
      <line x1={x + 6} y1={y} x2={line + 5} y2={y} />
      <line x1={x + 6} y1={y + height} x2={line + 5} y2={y + height} />
      <line x1={line} y1={y} x2={line} y2={y + height} />
      <line x1={line - 4} y1={y} x2={line + 4} y2={y + 6} />
      <line x1={line - 4} y1={y + height} x2={line + 4} y2={y + height - 6} />
      <text
        x={line + 8}
        y={y + height / 2}
        dominantBaseline="middle"
        fill={INK}
        stroke="none"
        fontSize={16}
        fontWeight={600}
      >
        {text}
      </text>
    </g>
  );
}

function View({
  index,
  title,
  w,
  h,
  scale,
  baseY,
  wText,
  hText,
  seat,
}: {
  index: number;
  title: string;
  w: number;
  h: number;
  scale: number;
  baseY: number;
  wText: string;
  hText: string;
  seat?: number;
}) {
  const cx = PANEL_W / 2 + PANEL_W * index - 8;
  const rw = w * scale;
  const rh = h * scale;
  const x = cx - rw / 2;
  const y = baseY - rh;
  return (
    <g>
      <text x={cx} y={26} textAnchor="middle" fill={MUTED} fontSize={13} fontWeight={600} letterSpacing={1.6}>
        {title.toUpperCase()}
      </text>
      <rect x={x} y={y} width={rw} height={rh} rx={6} fill={FILL} stroke={INK} strokeWidth={1.8} />
      {seat != null && seat * scale < rh - 10 && rw > 110 ? (
        <g>
          <line
            x1={x + 4}
            x2={x + rw - 4}
            y1={baseY - seat * scale}
            y2={baseY - seat * scale}
            stroke={INK}
            strokeWidth={1}
            strokeDasharray="5 4"
          />
          <text x={x + 8} y={baseY - seat * scale - 6} fill={MUTED} fontSize={12}>
            siedzisko {fmt(seat)}
          </text>
        </g>
      ) : null}
      <HorizontalDim x={x} y={baseY} width={rw} text={wText} />
      <VerticalDim x={x + rw} y={y} height={rh} text={hText} />
    </g>
  );
}

/** Rysunek gabarytowy: widok z przodu, z boku i z góry w jednej skali, z wymiarami z karty produktu. */
export function TechnicalDrawing({
  dims,
  seat,
}: {
  dims: Required<ProductDimsCm>;
  seat?: number;
}) {
  const { width: W, height: H, depth: D } = dims;
  const scale = Math.min(MAX_W / Math.max(W, D), MAX_H / Math.max(H, D));
  const tallest = Math.max(H, D) * scale;
  const baseY = TOP + tallest;
  const totalW = PANEL_W * 3 + 40;
  const totalH = baseY + 58;
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
        aria-label={`Rysunek techniczny: szerokość ${fmt(W)}, wysokość ${fmt(H)}, głębokość ${fmt(D)}`}
        className="mx-auto h-auto w-full min-w-[620px] max-w-[880px]"
      >
        <View index={0} title="Z przodu" w={W} h={H} scale={scale} baseY={baseY} wText={fmt(W)} hText={fmt(H)} seat={seat} />
        <View index={1} title="Z boku" w={D} h={H} scale={scale} baseY={baseY} wText={fmt(D)} hText={fmt(H)} seat={seat} />
        <View index={2} title="Z góry" w={W} h={D} scale={scale} baseY={baseY} wText={fmt(W)} hText={fmt(D)} />
      </svg>
    </div>
  );
}
