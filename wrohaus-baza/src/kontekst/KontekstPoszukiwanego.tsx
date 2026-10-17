"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

interface WantedThemeContextValue {
  unlocked: boolean;
  unlock: () => void;
}

const WantedThemeContext = createContext<WantedThemeContextValue | null>(null);

export function WantedThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith("/admin/kto-to-robil")) {
      setUnlocked(false);
    }
  }, [pathname]);

  const unlock = useCallback(() => setUnlocked(true), []);

  return (
    <WantedThemeContext.Provider value={{ unlocked, unlock }}>
      {children}
    </WantedThemeContext.Provider>
  );
}

export function useWantedTheme() {
  const ctx = useContext(WantedThemeContext);
  if (!ctx) {
    throw new Error("useWantedTheme must be used within WantedThemeProvider");
  }
  return ctx;
}
