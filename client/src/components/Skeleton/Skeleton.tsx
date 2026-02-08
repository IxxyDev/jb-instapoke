import styles from "./Skeleton.module.css";

export function Skeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={styles.title} />
        <div className={styles.tags}>
          <div className={styles.tag} />
          <div className={styles.tag} />
        </div>
        <div className={styles.stats}>
          <div className={styles.stat} />
          <div className={styles.stat} />
          <div className={styles.stat} />
        </div>
      </div>
    </div>
  );
}
