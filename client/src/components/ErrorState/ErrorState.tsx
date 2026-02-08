import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert">
      <p className={styles.title}>Something went wrong</p>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.button} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
