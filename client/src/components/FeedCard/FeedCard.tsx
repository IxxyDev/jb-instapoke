import type { Pokemon } from "@instapoke/shared";
import { memo } from "react";
import { LazyImage } from "../LazyImage/LazyImage";
import { TagChip } from "../TagChip/TagChip";
import styles from "./FeedCard.module.css";

interface FeedCardProps {
  pokemon: Pokemon;
  onTagClick: (tag: string) => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  specialAttack: "SPA",
  specialDefense: "SPD",
  speed: "SPE",
};

const MAX_STAT = 255;

export const FeedCard = memo(function FeedCard({
  pokemon,
  onTagClick,
}: FeedCardProps) {
  return (
    <article className={styles.card} aria-label={pokemon.displayName}>
      <LazyImage
        src={pokemon.spriteUrl}
        alt={pokemon.displayName}
        width={400}
        height={400}
      />
      <div className={styles.body}>
        <h2 className={styles.name}>{pokemon.displayName}</h2>
        <div className={styles.tags}>
          {pokemon.types.map((type) => (
            <TagChip
              key={type}
              label={`#${type}`}
              name={type}
              onClick={() => onTagClick(type)}
            />
          ))}
        </div>
        {pokemon.description && (
          <p className={styles.description}>{pokemon.description}</p>
        )}
        <div className={styles.stats}>
          {Object.entries(pokemon.stats).map(([key, value]) => (
            <div key={key} className={styles.statRow}>
              <span className={styles.statLabel}>
                {STAT_LABELS[key] ?? key}
              </span>
              <div className={styles.statBar}>
                <div
                  className={styles.statFill}
                  style={{
                    width: `${Math.min((value / MAX_STAT) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
});
