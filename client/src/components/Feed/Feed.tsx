import { useQueryClient } from "@tanstack/react-query";
import { useFeed } from "../../hooks/useFeed";
import { EmptyState } from "../EmptyState/EmptyState";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import { ErrorState } from "../ErrorState/ErrorState";
import { FeedCard } from "../FeedCard/FeedCard";
import { FilterBar } from "../FilterBar/FilterBar";
import { SearchBar } from "../SearchBar/SearchBar";
import { Skeleton } from "../Skeleton/Skeleton";
import { VirtualItem } from "../VirtualItem/VirtualItem";
import styles from "./Feed.module.css";

const CARD_ESTIMATED_HEIGHT = 600;

export function Feed() {
  const queryClient = useQueryClient();
  const {
    filters,
    items,
    total,
    allTags,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isError,
    isSuccess,
    error,
    refetch,
    nextSentinelRef,
    prevSentinelRef,
  } = useFeed();

  return (
    <ErrorBoundary
      onReset={() => queryClient.clear()}
      fallback={(err, reset) => (
        <ErrorState message={err.message} onRetry={reset} />
      )}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <SearchBar
            value={filters.q}
            activeTags={filters.tags}
            onChange={filters.setQuery}
            onRemoveTag={filters.toggleTag}
          />
          <FilterBar
            tags={allTags ?? null}
            activeTags={filters.tags}
            activeGenerations={filters.generation}
            onToggleTag={filters.toggleTag}
            onToggleGeneration={filters.toggleGeneration}
          />
          {total > 0 && <p className={styles.count}>{total} Pokémon found</p>}
        </header>

        <main role="feed" aria-busy={isFetching} className={styles.feed}>
          <div ref={prevSentinelRef} className={styles.sentinel} />
          {isFetchingPreviousPage && (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          )}
          {items.map((pokemon) => (
            <VirtualItem
              key={pokemon.id}
              estimatedHeight={CARD_ESTIMATED_HEIGHT}
            >
              <FeedCard pokemon={pokemon} onTagClick={filters.toggleTag} />
            </VirtualItem>
          ))}
          {(isLoading || isFetchingNextPage) && (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          )}
          {isError && (
            <ErrorState
              message={error?.message ?? "Unknown error"}
              onRetry={() => refetch()}
            />
          )}
          {isSuccess && items.length === 0 && (
            <EmptyState onClear={filters.clearFilters} />
          )}
          <div ref={nextSentinelRef} className={styles.sentinel} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
