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

export class PokemonStore {
  private readonly items: Pokemon[];
  private readonly byId: Map<number, Pokemon>;
  private readonly byType: Map<string, Set<number>>;
  private readonly byGeneration: Map<number, Set<number>>;

  constructor(pokemon: Pokemon[]) {
    this.items = this.shuffle(pokemon);
    this.byId = new Map(pokemon.map((pokemon) => [pokemon.id, pokemon]));
    this.byType = this.buildIndex(pokemon, (pokemon) => pokemon.types);
    this.byGeneration = this.buildIndex(pokemon, (pokemon) => [
      pokemon.generation,
    ]);
  }

  getById(id: number): Pokemon | undefined {
    return this.byId.get(id);
  }

  getFeed(query: FeedQuery): PaginatedResponse<Pokemon> {
    const limit = Math.min(
      Math.max(query.limit ?? PAGE_SIZE_DEFAULT, 1),
      PAGE_SIZE_MAX,
    );
    const matchingIds = this.getMatchingIds(query);
    const cursorIndex = query.cursor
      ? this.items.findIndex((p) => p.id === Number(query.cursor))
      : -1;
    const startIndex =
      query.cursor && cursorIndex === -1 ? this.items.length : cursorIndex + 1;

    const results: Pokemon[] = [];

    for (
      let i = startIndex;
      i < this.items.length && results.length < limit;
      i++
    ) {
      const pokemon = this.items[i]!;
      if (!matchingIds || matchingIds.has(pokemon.id)) {
        results.push(pokemon);
      }
    }
    const lastItem = results.at(-1);
    const nextCursor = lastItem ? String(lastItem.id) : null;
    const hasMore =
      nextCursor !== null && this.hasMoreAfter(nextCursor, matchingIds);

    const total = matchingIds ? matchingIds.size : this.items.length;

    return {
      data: results,
      pagination: { nextCursor, hasMore, total },
    };
  }

  getTags(): TagsResponse {
    const types: TagInfo[] = [...this.byType.entries()]
      .map(([name, ids]) => ({ name, count: ids.size }))
      .toSorted((a, b) => b.count - a.count);

    const generations: TagInfo[] = [...this.byGeneration.entries()]
      .map(([gen, ids]) => ({
        name: String(gen),
        label: `Gen ${gen}`,
        count: ids.size,
      }))
      .toSorted((a, b) => Number(a.name) - Number(b.name));

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

  private shuffle(arr: Pokemon[]): Pokemon[] {
    const shuffled = [...arr];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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
          .filter((pokemon) => pokemon.name.includes(q))
          .map((pokemon) => pokemon.id),
      );
      sets.push(nameMatches);
    }

    if (!sets.length) {
      return null;
    }

    return sets.reduce((acc, set) => {
      return new Set([...acc].filter((id) => set.has(id)));
    });
  }

  private hasMoreAfter(
    cursor: string,
    matchingIds: Set<number> | null,
  ): boolean {
    const startIndex = this.items.findIndex((p) => p.id === Number(cursor)) + 1;

    for (let i = startIndex; i < this.items.length; i++) {
      const pokemon = this.items[i]!;
      if (!matchingIds || matchingIds.has(pokemon.id)) {
        return true;
      }
    }

    return false;
  }
}

export async function loadStore(dataPath?: string): Promise<PokemonStore> {
  const path =
    dataPath ?? resolve(import.meta.dirname, "../../data/pokemon.json");
  const raw = await readFile(path, "utf-8");
  const pokemon: Pokemon[] = JSON.parse(raw);
  return new PokemonStore(pokemon);
}
