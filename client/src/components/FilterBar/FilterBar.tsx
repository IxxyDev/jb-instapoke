import type { TagsResponse } from "../../api/types";
import { TagChip } from "../TagChip/TagChip";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  tags: TagsResponse | null;
  activeTags: string[];
  activeGenerations: number[];
  onToggleTag: (tag: string) => void;
  onToggleGeneration: (gen: number) => void;
}

export function FilterBar({
  tags,
  activeTags,
  activeGenerations,
  onToggleTag,
  onToggleGeneration,
}: FilterBarProps) {
  if (!tags) return null;

  return (
    <fieldset className={styles.container} aria-label="Filters">
      <div className={styles.scroll}>
        {tags.types.map((t) => (
          <TagChip
            key={t.name}
            label={`#${t.name}`}
            name={t.name}
            active={activeTags.includes(t.name)}
            onClick={() => onToggleTag(t.name)}
          />
        ))}
        {tags.generations.map((g) => {
          const gen = Number(g.name);
          if (!Number.isFinite(gen) || gen < 1) return null;
          return (
            <TagChip
              key={`gen-${g.name}`}
              label={g.label ?? `Gen ${g.name}`}
              active={activeGenerations.includes(gen)}
              onClick={() => onToggleGeneration(gen)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
