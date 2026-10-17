import type { DeliveryIcon } from "@/lib/dostawa";
import { Home, MapPin, Package, Truck } from "lucide-react";

export function DeliveryMethodIcon({
  icon,
  className,
  strokeWidth = 1.5,
}: {
  icon: DeliveryIcon;
  className?: string;
  strokeWidth?: number;
}) {
  switch (icon) {
    case "home":
      return <Home className={className} strokeWidth={strokeWidth} />;
    case "map-pin":
      return <MapPin className={className} strokeWidth={strokeWidth} />;
    case "truck":
      return <Truck className={className} strokeWidth={strokeWidth} />;
    default:
      return <Package className={className} strokeWidth={strokeWidth} />;
  }
}
