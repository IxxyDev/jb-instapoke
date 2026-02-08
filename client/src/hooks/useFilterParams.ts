import { useSyncExternalStore, useCallback } from "react";

interface FilterParams {
  q: string;
  tags: string[];
  generation: number[];
  cursor: string;
}

let cachedSearch = "";
let cachedSnapshot: FilterParams = {
  q: "",
  tags: [],
  generation: [],
  cursor: "",
};

function getSnapshot(): FilterParams {
  const search = window.location.search;
  if (search === cachedSearch) return cachedSnapshot;

  cachedSearch = search;
  const params = new URLSearchParams(search);
  cachedSnapshot = {
    q: params.get("q") ?? "",
    tags: params.get("tags")?.split(",").filter(Boolean) ?? [],
    generation:
      params
        .get("generation")
        ?.split(",")
        .filter(Boolean)
        .map(Number)
        .filter((n) => !isNaN(n) && n >= 1) ?? [],
    cursor: params.get("cursor") ?? "",
  };
  return cachedSnapshot;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function applyParams(next: FilterParams) {
  const url = new URL(window.location.href);

  if (next.q) url.searchParams.set("q", next.q);
  else url.searchParams.delete("q");

  if (next.tags.length) url.searchParams.set("tags", next.tags.join(","));
  else url.searchParams.delete("tags");

  if (next.generation.length)
    url.searchParams.set("generation", next.generation.join(","));
  else url.searchParams.delete("generation");

  if (next.cursor) url.searchParams.set("cursor", next.cursor);
  else url.searchParams.delete("cursor");

  window.history.replaceState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useFilterParams() {
  const params = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setQuery = useCallback((q: string) => {
    applyParams({ ...getSnapshot(), q, cursor: "" });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    const current = getSnapshot();
    const tags = current.tags.includes(tag)
      ? current.tags.filter((t) => t !== tag)
      : [...current.tags, tag];
    applyParams({ ...current, tags, cursor: "" });
  }, []);

  const toggleGeneration = useCallback((gen: number) => {
    const current = getSnapshot();
    const generation = current.generation.includes(gen)
      ? current.generation.filter((g) => g !== gen)
      : [...current.generation, gen];
    applyParams({ ...current, generation, cursor: "" });
  }, []);

  const clearFilters = useCallback(() => {
    applyParams({ q: "", tags: [], generation: [], cursor: "" });
  }, []);

  return { ...params, setQuery, toggleTag, toggleGeneration, clearFilters };
}
