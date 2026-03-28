import { TYPE_COLORS } from "@instapoke/shared";

import styles from "./TagChip.module.css";

interface TagChipProps {
  label: string;
  name?: string;
  active?: boolean;
  onClick?: () => void;
}

export function TagChip({
  label,
  name,
  active = false,
  onClick,
}: TagChipProps) {
  const color = TYPE_COLORS[name ?? label] ?? "var(--color-text-secondary)";

  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.active : ""}`}
      style={{ "--chip-color": color } as React.CSSProperties}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
