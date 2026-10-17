"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_PRODUCT_TAGS,
  mergeProductTags,
  tagStyleRecord,
  type ProductTagDefinition,
  type ProductTagId,
  type ProductTagsConfig,
} from "@/lib/tagi";

type TagsContextValue = {
  tags: Record<ProductTagId, ProductTagDefinition>;
  ready: boolean;
  refresh: () => Promise<void>;
};

const TagsContext = createContext<TagsContextValue | null>(null);

export function TagsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ProductTagsConfig>(DEFAULT_PRODUCT_TAGS);
  const [ready, setReady] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setConfig(mergeProductTags(data));
      }
    } catch {
      setConfig(DEFAULT_PRODUCT_TAGS);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    load();
    const onFocus = () => load();
    const onTagsUpdated = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("sofelio:tags-updated", onTagsUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("sofelio:tags-updated", onTagsUpdated);
    };
  }, []);

  const value = useMemo(
    () => ({
      tags: tagStyleRecord(config),
      ready,
      refresh: load,
    }),
    [config, ready]
  );

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
}

export function useProductTags() {
  const ctx = useContext(TagsContext);
  if (!ctx) {
    return {
      tags: tagStyleRecord(DEFAULT_PRODUCT_TAGS),
      ready: true,
      refresh: async () => {},
    };
  }
  return ctx;
}

export function useProductTag(id: ProductTagId): ProductTagDefinition {
  const { tags } = useProductTags();
  return tags[id];
}
