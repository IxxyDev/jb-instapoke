import type { TagsResponse } from "@instapoke/shared";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchFeed, fetchTags } from "../api/client";
import { useFilterParams } from "./useFilterParams";
import { useInfiniteScroll } from "./useInfiniteScroll";

export function useFeed() {
  const filters = useFilterParams();
  const { q, tags, generation, cursor } = filters;

  const initialPageParam = cursor
    ? { cursor, direction: "forward" as const }
    : undefined;

  const feed = useInfiniteQuery({
    queryKey: ["feed", q, tags, generation, cursor],
    queryFn: ({ pageParam, signal }) =>
      fetchFeed(
        {
          cursor: pageParam?.cursor,
          direction: pageParam?.direction,
          tags: tags.length ? tags : undefined,
          generation: generation.length ? generation : undefined,
          q: q || undefined,
        },
        signal,
      ),
    initialPageParam: initialPageParam as
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
    queryFn: ({ signal }) => fetchTags(signal),
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
