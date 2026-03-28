import { createParser, parseAsString, useQueryStates } from "nuqs";
import { useCallback } from "react";

const commaSeparatedStrings = createParser({
  parse: (value: string) => value.split(",").filter(Boolean),
  serialize: (value: string[]) => value.join(","),
}).withDefault([]);

const commaSeparatedIntegers = createParser({
  parse: (value: string) =>
    value
      .split(",")
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 1),
  serialize: (value: number[]) => value.join(","),
}).withDefault([]);

const filterConfig = {
  q: parseAsString.withDefault(""),
  tags: commaSeparatedStrings,
  generation: commaSeparatedIntegers,
};

export function useFilterParams() {
  const [params, setParams] = useQueryStates(filterConfig, {
    history: "replace",
  });

  const setQuery = useCallback(
    (q: string) => {
      setParams({ q });
    },
    [setParams],
  );

  const toggleTag = useCallback(
    (tag: string) => {
      setParams((prev) => ({
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      }));
    },
    [setParams],
  );

  const toggleGeneration = useCallback(
    (gen: number) => {
      setParams((prev) => ({
        generation: prev.generation.includes(gen)
          ? prev.generation.filter((g) => g !== gen)
          : [...prev.generation, gen],
      }));
    },
    [setParams],
  );

  const clearFilters = useCallback(() => {
    setParams({ q: "", tags: [], generation: [] });
  }, [setParams]);

  return {
    q: params.q,
    tags: params.tags,
    generation: params.generation,
    setQuery,
    toggleTag,
    toggleGeneration,
    clearFilters,
  };
}
