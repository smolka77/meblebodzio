"use client";

import { useEffect, useRef } from "react";

export function CursorMark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      el.style.display = "none";
      return;
    }
    const move = (event: PointerEvent) => {
      el.style.transform = `translate(${event.clientX - 5}px, ${event.clientY - 5}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-[70] hidden h-2.5 w-2.5 bg-green md:block"
      aria-hidden
    />
  );
}
