import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "../api/client";
import type { TagsResponse } from "../api/types";
import { useFilterParams } from "./useFilterParams";
import { useInfiniteScroll } from "./useInfiniteScroll";

export function useFeed() {
  const filters = useFilterParams();
  const { q, tags, generation } = filters;

  const feed = useInfiniteQuery({
    queryKey: ["feed", q, tags, generation],
    queryFn: async ({ pageParam, signal }) => {
      const { data, error } = await api.GET("/api/feed", {
        params: {
          query: {
            cursor: pageParam?.cursor,
            direction: pageParam?.direction,
            tags: tags.length ? tags.join(",") : undefined,
            generation: generation.length ? generation.join(",") : undefined,
            q: q || undefined,
          },
        },
        signal,
      });
      if (error) throw new Error(error.error);
      return data;
    },
    initialPageParam: undefined as
      | { cursor: string; direction: "forward" | "backward" }
      | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? {
            cursor: lastPage.pagination.nextCursor,
            direction: "forward" as const,
          }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.hasPrevious && firstPage.pagination.previousCursor
        ? {
            cursor: firstPage.pagination.previousCursor,
            direction: "backward" as const,
          }
        : undefined,
  });

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: async ({ signal }) => {
      const { data, error } = await api.GET("/api/tags", { signal });
      if (error) throw new Error("Failed to fetch tags");
      return data;
    },
    staleTime: Infinity,
  });

  const items = useMemo(
    () => feed.data?.pages.flatMap((page) => page.data) ?? [],
    [feed.data?.pages],
  );
  const total = feed.data?.pages.at(-1)?.pagination.total ?? 0;

  const nextSentinelRef = useInfiniteScroll(
    () => feed.fetchNextPage(),
    feed.hasNextPage && !feed.isFetchingNextPage && !feed.isError,
  );

  const prevSentinelRef = useInfiniteScroll(
    () => feed.fetchPreviousPage(),
    feed.hasPreviousPage && !feed.isFetchingPreviousPage && !feed.isError,
  );

  return {
    filters,
    items,
    total,
    allTags: tagsQuery.data as TagsResponse | undefined,
    isLoading: feed.isLoading,
    isFetching: feed.isFetching,
    isFetchingNextPage: feed.isFetchingNextPage,
    isFetchingPreviousPage: feed.isFetchingPreviousPage,
    isError: feed.isError,
    isSuccess: feed.isSuccess,
    error: feed.error,
    refetch: feed.refetch,
    nextSentinelRef,
    prevSentinelRef,
  };
}
