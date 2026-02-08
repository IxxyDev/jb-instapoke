import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  onClear?: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className={styles.container} role="status">
      <p className={styles.title}>No Pokémon found</p>
      <p className={styles.subtitle}>Try adjusting your search or filters</p>
      {onClear && (
        <button className={styles.button} onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
