"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { TrendingUp, Radio } from "lucide-react";
import { formatPrice } from "@/lib/dane";
import type { RevenueTimelines, RevenueTimelinePoint } from "@/lib/typy";

type SessionKey = keyof RevenueTimelines;

const SESSION_LABELS: Record<SessionKey, string> = {
  today: "Dziś",
  week: "7 dni",
  all: "Całość",
};

interface RevenueChartProps {
  data?: RevenueTimelines;
  pollMs?: number;
}

const CHART = { w: 600, h: 240, pad: { top: 20, right: 24, bottom: 36, left: 72 } };

function buildStepPath(
  points: RevenueTimelinePoint[],
  maxY: number
): {
  path: string;
  areaPath: string;
  coords: { x: number; y: number; point: RevenueTimelinePoint }[];
} {
  const { w, h, pad } = CHART;
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  if (points.length === 0 || maxY <= 0) {
    return { path: "", areaPath: "", coords: [] };
  }

  const times = points.map((p) => new Date(p.time).getTime());
  const minT = times[0];
  const maxT = times[times.length - 1];
  const timeRange = Math.max(maxT - minT, 1);

  const coords = points.map((point) => {
    const t = new Date(point.time).getTime();
    const x = pad.left + ((t - minT) / timeRange) * chartW;
    const y = pad.top + chartH - (point.cumulative / maxY) * chartH;
    return { x, y, point };
  });

  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    path += ` L ${coords[i].x} ${coords[i - 1].y} L ${coords[i].x} ${coords[i].y}`;
  }

  const baseline = pad.top + chartH;
  const areaPath =
    path +
    ` L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`;

  return { path, areaPath, coords };
}

function compactPrice(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k zł`;
  }
  return `${value} zł`;
}

function yAxisTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const ticks: number[] = [0];
  for (let v = step; v < max; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return [...new Set(ticks)];
}

export function RevenueChart({ data, pollMs }: RevenueChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const [session, setSession] = useState<SessionKey>("today");
  const [flash, setFlash] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const prevTotal = useRef<number | null>(null);

  const sessionData = data?.[session] ?? { points: [], total: 0 };
  const { points, total } = sessionData;

  useEffect(() => {
    if (prevTotal.current !== null && total > prevTotal.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1400);
      prevTotal.current = total;
      return () => clearTimeout(t);
    }
    prevTotal.current = total;
  }, [total]);

  const maxY = Math.max(...points.map((p) => p.cumulative), 1);
  const ticks = yAxisTicks(maxY);
  const chartMaxY = ticks[ticks.length - 1] || maxY;

  const { path, areaPath, coords } = useMemo(
    () => buildStepPath(points, chartMaxY),
    [points, chartMaxY]
  );

  const lastOrder = [...points].reverse().find((p) => p.delta > 0);
  const orderCount = points.filter((p) => p.delta > 0).length;
  const { h, pad } = CHART;
  const chartH = h - pad.top - pad.bottom;

  return (
    <div className="overflow-hidden rounded-xl border border-taupe/30 bg-white">
      {/* Header */}
      <div className="border-b border-taupe/20 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Radio
                className={`h-3.5 w-3.5 ${flash ? "text-charcoal" : "text-sand"}`}
                strokeWidth={1.5}
              />
              <p className="text-[10px] tracking-[0.25em] text-sand uppercase">
                Przychód ze sprzedaży
              </p>
              <span className="hidden h-1 w-1 rounded-full bg-taupe/60 sm:inline-block" />
              <span className="hidden text-[10px] tracking-[0.15em] text-sand/80 uppercase sm:inline">
                sesja {SESSION_LABELS[session].toLowerCase()}
              </span>
            </div>

            <p
              className={`mt-2 font-serif text-3xl text-charcoal transition-all duration-500 sm:text-4xl ${
                flash ? "scale-[1.01] text-charcoal" : ""
              }`}
            >
              {formatPrice(total)}
            </p>

            {lastOrder && lastOrder.delta > 0 ? (
              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${
                  flash
                    ? "border-charcoal/30 bg-charcoal text-cream"
                    : "border-taupe/40 bg-cream-light text-charcoal"
                }`}
              >
                <TrendingUp className="h-3 w-3" strokeWidth={2} />
                <span className="font-medium">+{formatPrice(lastOrder.delta)}</span>
                {lastOrder.orderId && (
                  <span className={flash ? "text-cream/70" : "text-sand"}>
                    {lastOrder.orderId}
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-sand">
                Brak zamówień w tej sesji
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <div className="flex w-full rounded-lg border border-taupe/30 bg-cream-light/50 p-1 sm:w-auto">
              {(Object.keys(SESSION_LABELS) as SessionKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSession(key)}
                  className={`flex-1 rounded-md px-3 py-2 text-[10px] tracking-[0.1em] uppercase transition-colors sm:flex-none sm:px-4 sm:text-[11px] sm:tracking-[0.12em] ${
                    session === key
                      ? "bg-charcoal text-cream shadow-sm"
                      : "text-sand hover:text-charcoal"
                  }`}
                >
                  {SESSION_LABELS[key]}
                </button>
              ))}
            </div>
            {orderCount > 0 && (
              <p className="text-[10px] tracking-wide text-sand uppercase">
                {orderCount}{" "}
                {orderCount === 1 ? "zamówienie" : orderCount < 5 ? "zamówienia" : "zamówień"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="bg-gradient-to-b from-cream-light/40 to-white px-4 pb-4 pt-3">
        <svg
          viewBox={`0 0 ${CHART.w} ${CHART.h}`}
          className="h-56 w-full"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111111" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#111111" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid */}
          {ticks.map((tick) => {
            const y = pad.top + chartH - (tick / chartMaxY) * chartH;
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={CHART.w - pad.right}
                  y2={y}
                  stroke="#B8B0A3"
                  strokeOpacity={0.25}
                />
                <text
                  x={pad.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9A8B7A"
                  fontSize={10}
                >
                  {compactPrice(tick)}
                </text>
              </g>
            );
          })}

          {points.length <= 1 && total === 0 ? (
            <>
              <line
                x1={pad.left}
                y1={pad.top + chartH}
                x2={CHART.w - pad.right}
                y2={pad.top + chartH}
                stroke="#B8B0A3"
                strokeOpacity={0.5}
                strokeWidth={1}
              />
              <text
                x={CHART.w / 2}
                y={CHART.h / 2 - 4}
                textAnchor="middle"
                fill="#9A8B7A"
                fontSize={12}
              >
                Oczekiwanie na zamówienia…
              </text>
              <text
                x={CHART.w / 2}
                y={CHART.h / 2 + 14}
                textAnchor="middle"
                fill="#B8B0A3"
                fontSize={10}
              >
                Wykres zaktualizuje się po pierwszej sprzedaży
              </text>
            </>
          ) : (
            <>
              <path d={areaPath} fill={`url(#${gradientId})`} />
              <path
                d={path}
                fill="none"
                stroke="#111111"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={flash ? "opacity-100" : "opacity-90"}
              />

              {/* Order step markers */}
              {coords.map(({ x, y, point }, i) =>
                point.delta > 0 ? (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r={hovered === i ? 5.5 : 4}
                      fill="#111111"
                      stroke="#F8F7F4"
                      strokeWidth={2}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHovered(i)}
                    />
                    {hovered === i && (
                      <>
                        <line
                          x1={x}
                          y1={pad.top}
                          x2={x}
                          y2={pad.top + chartH}
                          stroke="#B8B0A3"
                          strokeOpacity={0.6}
                          strokeDasharray="4 4"
                        />
                        <rect
                          x={x - 58}
                          y={y - 44}
                          width={116}
                          height={36}
                          rx={6}
                          fill="white"
                          stroke="#D8D0C4"
                          strokeWidth={1}
                        />
                        <text
                          x={x}
                          y={y - 28}
                          textAnchor="middle"
                          fill="#111111"
                          fontSize={11}
                          fontWeight="600"
                        >
                          +{formatPrice(point.delta)}
                        </text>
                        <text
                          x={x}
                          y={y - 14}
                          textAnchor="middle"
                          fill="#9A8B7A"
                          fontSize={9}
                        >
                          {point.label}
                          {point.orderId ? ` · ${point.orderId}` : ""}
                        </text>
                      </>
                    )}
                  </g>
                ) : null
              )}

              {/* Current level guide */}
              {coords.length > 0 && total > 0 && (
                <line
                  x1={pad.left}
                  y1={coords[coords.length - 1].y}
                  x2={CHART.w - pad.right}
                  y2={coords[coords.length - 1].y}
                  stroke="#111111"
                  strokeOpacity={0.12}
                  strokeDasharray="6 4"
                />
              )}
            </>
          )}

          {/* X-axis */}
          {coords.length > 0 && (
            <>
              <line
                x1={pad.left}
                y1={pad.top + chartH}
                x2={CHART.w - pad.right}
                y2={pad.top + chartH}
                stroke="#D8D0C4"
                strokeWidth={1}
              />
              <text
                x={coords[0].x}
                y={CHART.h - 10}
                fill="#9A8B7A"
                fontSize={10}
              >
                {coords[0].point.label}
              </text>
              <text
                x={coords[coords.length - 1].x}
                y={CHART.h - 10}
                textAnchor="end"
                fill="#9A8B7A"
                fontSize={10}
              >
                {coords[coords.length - 1].point.label}
              </text>
            </>
          )}
        </svg>

        <div className="flex items-center justify-between border-t border-taupe/15 px-2 pt-3">
          <p className="text-[10px] tracking-wide text-sand uppercase">
            Wykres skumulowany · krok przy każdym zamówieniu
          </p>
          {pollMs && (
            <p className="text-[10px] text-sand/70">
              Live · co {pollMs / 1000}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
