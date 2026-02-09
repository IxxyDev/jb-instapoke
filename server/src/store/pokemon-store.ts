import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type {
  FeedQuery,
  PaginatedResponse,
  Pokemon,
  TagInfo,
  TagsResponse,
} from "@instapoke/shared";
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX } from "@instapoke/shared";

export interface PokemonStoreOptions {
  seed?: number;
}

export class PokemonStore {
  private readonly items: Pokemon[];
  private readonly byId: Map<number, Pokemon>;
  private readonly idToIndex: Map<number, number>;
  private readonly byType: Map<string, Set<number>>;
  private readonly byGeneration: Map<number, Set<number>>;
  private readonly cachedTags: TagsResponse;

  constructor(pokemon: Pokemon[], options: PokemonStoreOptions = {}) {
    this.items = this.shuffle(pokemon, options.seed ?? 42);
    this.byId = new Map(pokemon.map((p) => [p.id, p]));
    this.idToIndex = new Map(this.items.map((p, i) => [p.id, i]));
    this.byType = this.buildIndex(pokemon, (p) => p.types);
    this.byGeneration = this.buildIndex(pokemon, (p) => [p.generation]);
    this.cachedTags = this.computeTags();
  }

  getById(id: number): Pokemon | undefined {
    return this.byId.get(id);
  }

  getFeed(query: FeedQuery): PaginatedResponse<Pokemon> {
    const limit = Math.min(query.limit ?? PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
    const matchingIds = this.getMatchingIds(query);
    const direction = query.direction ?? "forward";

    if (direction === "backward") {
      return this.getFeedBackward(query.cursor, limit, matchingIds);
    }

    return this.getFeedForward(query.cursor, limit, matchingIds);
  }

  private getFeedForward(
    cursor: string | undefined,
    limit: number,
    matchingIds: Set<number> | null,
  ): PaginatedResponse<Pokemon> {
    const startIndex = this.resolveCursorForward(cursor);

    const results: Pokemon[] = [];
    let hasMore = false;

    for (let i = startIndex; i < this.items.length; i++) {
      const pokemon = this.items[i]!;
      if (!matchingIds || matchingIds.has(pokemon.id)) {
        if (results.length < limit) {
          results.push(pokemon);
        } else {
          hasMore = true;
          break;
        }
      }
    }

    const hasPrevious = this.hasMatchingBefore(startIndex, matchingIds);
    const lastItem = results.at(-1);
    const firstItem = results[0];
    const nextCursor = hasMore && lastItem ? String(lastItem.id) : null;
    const previousCursor =
      hasPrevious && firstItem ? String(firstItem.id) : null;
    const total = matchingIds ? matchingIds.size : this.items.length;

    return {
      data: results,
      pagination: { nextCursor, previousCursor, hasMore, hasPrevious, total },
    };
  }

  private getFeedBackward(
    cursor: string | undefined,
    limit: number,
    matchingIds: Set<number> | null,
  ): PaginatedResponse<Pokemon> {
    const endIndex = this.resolveCursorBackward(cursor);

    const results: Pokemon[] = [];
    let hasPrevious = false;

    for (let i = endIndex; i >= 0; i--) {
      const pokemon = this.items[i]!;
      if (!matchingIds || matchingIds.has(pokemon.id)) {
        if (results.length < limit) {
          results.push(pokemon);
        } else {
          hasPrevious = true;
          break;
        }
      }
    }

    results.reverse();

    const hasMore = this.hasMatchingAfterInclusive(endIndex + 1, matchingIds);
    const firstItem = results[0];
    const lastItem = results.at(-1);
    const previousCursor =
      hasPrevious && firstItem ? String(firstItem.id) : null;
    const nextCursor = hasMore && lastItem ? String(lastItem.id) : null;
    const total = matchingIds ? matchingIds.size : this.items.length;

    return {
      data: results,
      pagination: { nextCursor, previousCursor, hasMore, hasPrevious, total },
    };
  }

  getTags(): TagsResponse {
    return this.cachedTags;
  }

  private resolveCursorForward(cursor: string | undefined): number {
    if (!cursor) return 0;
    const index = this.idToIndex.get(Number(cursor));
    if (index === undefined) return this.items.length;
    return index + 1;
  }

  private resolveCursorBackward(cursor: string | undefined): number {
    if (!cursor) return this.items.length - 1;
    const index = this.idToIndex.get(Number(cursor));
    if (index === undefined) return -1;
    return index - 1;
  }

  private hasMatchingBefore(
    index: number,
    matchingIds: Set<number> | null,
  ): boolean {
    for (let i = index - 1; i >= 0; i--) {
      const pokemon = this.items[i]!;
      if (!matchingIds || matchingIds.has(pokemon.id)) return true;
    }
    return false;
  }

  private hasMatchingAfterInclusive(
    index: number,
    matchingIds: Set<number> | null,
  ): boolean {
    for (let i = index; i < this.items.length; i++) {
      const pokemon = this.items[i]!;
      if (!matchingIds || matchingIds.has(pokemon.id)) return true;
    }
    return false;
  }

  private computeTags(): TagsResponse {
    const types: TagInfo[] = [...this.byType.entries()]
      .map(([name, ids]) => ({ name, count: ids.size }))
      .sort((a, b) => b.count - a.count);

    const generations: TagInfo[] = [...this.byGeneration.entries()]
      .map(([gen, ids]) => ({
        name: String(gen),
        label: `Gen ${gen}`,
        count: ids.size,
      }))
      .sort((a, b) => Number(a.name) - Number(b.name));

    return { types, generations };
  }

  private buildIndex<K extends string | number>(
    pokemon: Pokemon[],
    keysFn: (p: Pokemon) => K[],
  ): Map<K, Set<number>> {
    const index = new Map<K, Set<number>>();

    for (const p of pokemon) {
      for (const key of keysFn(p)) {
        let set = index.get(key);
        if (!set) {
          set = new Set();
          index.set(key, set);
        }
        set.add(p.id);
      }
    }

    return index;
  }

  private shuffle(arr: Pokemon[], seed: number): Pokemon[] {
    const shuffled = [...arr];
    let s = seed;

    const nextRandom = () => {
      s = (s * 1664525 + 1013904223) & 0x7fffffff;
      return s / 0x7fffffff;
    };

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(nextRandom() * (i + 1));
      [shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!];
    }

    return shuffled;
  }

  private getMatchingIds(query: FeedQuery): Set<number> | null {
    const sets: Set<number>[] = [];

    if (query.tags?.length) {
      const union = new Set<number>();
      for (const tag of query.tags) {
        const ids = this.byType.get(tag);
        if (ids) ids.forEach((id) => union.add(id));
      }
      sets.push(union);
    }

    if (query.generation?.length) {
      const union = new Set<number>();
      for (const gen of query.generation) {
        const ids = this.byGeneration.get(gen);
        if (ids) ids.forEach((id) => union.add(id));
      }
      sets.push(union);
    }

    if (query.q) {
      const q = query.q.toLowerCase();
      const nameMatches = new Set(
        this.items
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.displayName.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q),
          )
          .map((p) => p.id),
      );
      sets.push(nameMatches);
    }

    if (!sets.length) {
      return null;
    }

    return sets.reduce((acc, set) => {
      const result = new Set<number>();
      for (const id of acc) {
        if (set.has(id)) result.add(id);
      }
      return result;
    });
  }
}

export async function loadStore(dataPath?: string): Promise<PokemonStore> {
  const path =
    dataPath ?? resolve(import.meta.dirname, "../../data/pokemon.json");

  let raw: string;
  try {
    raw = await readFile(path, "utf-8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    throw new Error(
      `Failed to load pokemon data from ${path}: ${code === "ENOENT" ? "file not found. Run 'npm run seed' first." : String(err)}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse pokemon data from ${path}: invalid JSON`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(
      `Invalid pokemon data in ${path}: expected non-empty array`,
    );
  }

  const first = parsed[0] as Record<string, unknown>;
  if (typeof first["id"] !== "number" || typeof first["name"] !== "string") {
    throw new Error(
      `Invalid pokemon data in ${path}: objects must have 'id' (number) and 'name' (string)`,
    );
  }

  return new PokemonStore(parsed as Pokemon[]);
}
