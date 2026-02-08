import { useState, useCallback, useRef, useEffect } from "react";
import { TagChip } from "../TagChip/TagChip";
import styles from "./SearchBar.module.css";

const DEBOUNCE_MS = 300;

interface SearchBarProps {
  value: string;
  activeTags: string[];
  onChange: (value: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function SearchBar({
  value,
  activeTags,
  onChange,
  onRemoveTag,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(value);
    clearTimeout(timerRef.current);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocal(v);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(v);
      }, DEBOUNCE_MS);
    },
    [onChange],
  );

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="search"
        placeholder="Search Pokémon..."
        value={local}
        onChange={handleChange}
        aria-label="Search Pokémon"
      />
      {activeTags.length > 0 && (
        <div className={styles.chips}>
          {activeTags.map((tag) => (
            <TagChip
              key={tag}
              label={`#${tag}`}
              name={tag}
              active
              onClick={() => onRemoveTag(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
