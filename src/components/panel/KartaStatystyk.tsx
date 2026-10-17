import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
}

export function StatsCard({ title, value, change, icon: Icon }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-xl border border-taupe/30 bg-white p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-wide text-sand uppercase">{title}</p>
          <p className="mt-2 text-xl font-semibold text-charcoal sm:text-2xl">{value}</p>
          {change !== undefined && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs ${
                isPositive ? "text-green-600" : "text-red-500"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change}% vs poprzedni miesiąc
            </div>
          )}
        </div>
        <div className="rounded-lg bg-cream-light p-3">
          <Icon className="h-5 w-5 text-charcoal" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
