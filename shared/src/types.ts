export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  spriteUrl: string;
  types: string[];
  abilities: string[];
  generation: number;
  genus: string;
  description: string;
  stats: PokemonStats;
  color: string;
  height: number;
  weight: number;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    previousCursor: string | null;
    hasMore: boolean;
    hasPrevious: boolean;
    total: number;
  };
}

export interface FeedQuery {
  cursor?: string;
  direction?: "forward" | "backward";
  limit?: number;
  tags?: string[];
  generation?: number[];
  q?: string;
}

export interface TagInfo {
  name: string;
  count: number;
  label?: string;
}

export interface TagsResponse {
  types: TagInfo[];
  generations: TagInfo[];
}
