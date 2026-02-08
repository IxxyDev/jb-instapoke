import type { Pokemon } from "@instapoke/shared";
import { PokemonStore } from "../store/pokemon-store.js";
import { makePokemon } from "./helpers.js";

const testData: Pokemon[] = [
  makePokemon({
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    generation: 1,
  }),
  makePokemon({ id: 4, name: "charmander", types: ["fire"], generation: 1 }),
  makePokemon({ id: 7, name: "squirtle", types: ["water"], generation: 1 }),
  makePokemon({ id: 25, name: "pikachu", types: ["electric"], generation: 1 }),
  makePokemon({ id: 152, name: "chikorita", types: ["grass"], generation: 2 }),
  makePokemon({ id: 155, name: "cyndaquil", types: ["fire"], generation: 2 }),
  makePokemon({ id: 252, name: "treecko", types: ["grass"], generation: 3 }),
];

const SEED = 123;
let store: PokemonStore;

beforeEach(() => {
  store = new PokemonStore(testData, { seed: SEED });
});

describe("deterministic shuffle", () => {
  it("should produce the same order with the same seed", () => {
    const store1 = new PokemonStore(testData, { seed: SEED });
    const store2 = new PokemonStore(testData, { seed: SEED });

    const ids1 = store1.getFeed({}).data.map((p) => p.id);
    const ids2 = store2.getFeed({}).data.map((p) => p.id);

    expect(ids1).toEqual(ids2);
  });

  it("should produce different order with different seeds", () => {
    const store1 = new PokemonStore(testData, { seed: 1 });
    const store2 = new PokemonStore(testData, { seed: 2 });

    const ids1 = store1.getFeed({}).data.map((p) => p.id);
    const ids2 = store2.getFeed({}).data.map((p) => p.id);

    expect(ids1).not.toEqual(ids2);
  });
});

describe("getById", () => {
  it("should return pokemon by id", () => {
    const result = store.getById(25);

    expect(result?.name).toEqual("pikachu");
  });

  it("should return undefined for non-existent id", () => {
    expect(store.getById(999)).toBeUndefined();
  });
});

describe("getFeed pagination", () => {
  it("should return first page with default limit", () => {
    const result = store.getFeed({});

    expect(result.data.length).toEqual(7);
    expect(result.pagination.hasMore).toEqual(false);
    expect(result.pagination.total).toEqual(7);
  });

  it("should respect limit", () => {
    const result = store.getFeed({ limit: 3 });

    expect(result.data.length).toEqual(3);
    expect(result.pagination.hasMore).toEqual(true);
    expect(result.pagination.nextCursor).not.toBeNull();
  });

  it("should paginate with cursor", () => {
    const page1 = store.getFeed({ limit: 3 });
    const page2 = store.getFeed({
      limit: 3,
      cursor: page1.pagination.nextCursor!,
    });

    expect(page2.data.length).toEqual(3);
    const page1Ids = page1.data.map((p) => p.id);
    const page2Ids = page2.data.map((p) => p.id);
    expect(page1Ids.filter((id) => page2Ids.includes(id))).toEqual([]);
  });

  it("should return all items across pages", () => {
    const allIds: number[] = [];
    let cursor: string | undefined;

    while (true) {
      const page = store.getFeed({ limit: 2, cursor });
      allIds.push(...page.data.map((p) => p.id));
      if (!page.pagination.hasMore) break;
      cursor = page.pagination.nextCursor!;
    }

    expect(allIds.length).toEqual(7);
    expect(new Set(allIds).size).toEqual(7);
  });

  it("should clamp limit to max 50", () => {
    const result = store.getFeed({ limit: 100 });

    expect(result.data.length).toEqual(7);
  });

  it("should return empty data for invalid cursor", () => {
    const result = store.getFeed({ cursor: "999999" });

    expect(result.data).toEqual([]);
    expect(result.pagination.hasMore).toEqual(false);
    expect(result.pagination.nextCursor).toBeNull();
  });

  it("should return hasMore false on last page", () => {
    const result = store.getFeed({ limit: 100 });

    expect(result.pagination.hasMore).toEqual(false);
  });
});

describe("getFeed filtering", () => {
  it("should filter by single type", () => {
    const result = store.getFeed({ tags: ["fire"] });

    expect(result.data.every((p) => p.types.includes("fire"))).toEqual(true);
    expect(result.pagination.total).toEqual(2);
  });

  it("should filter by multiple types (OR within tags)", () => {
    const result = store.getFeed({ tags: ["fire", "water"] });

    expect(
      result.data.every(
        (p) => p.types.includes("fire") || p.types.includes("water"),
      ),
    ).toEqual(true);
  });

  it("should filter by generation", () => {
    const result = store.getFeed({ generation: [2] });

    expect(result.data.every((p) => p.generation === 2)).toEqual(true);
    expect(result.pagination.total).toEqual(2);
  });

  it("should filter by name search", () => {
    const result = store.getFeed({ q: "saur" });

    expect(result.data.length).toEqual(1);
    expect(result.data[0]!.name).toEqual("bulbasaur");
  });

  it("should combine tag and generation filters (AND)", () => {
    const result = store.getFeed({ tags: ["grass"], generation: [1] });

    expect(result.data.length).toEqual(1);
    expect(result.data[0]!.name).toEqual("bulbasaur");
  });

  it("should combine tag and name search (AND)", () => {
    const result = store.getFeed({ tags: ["grass"], q: "tree" });

    expect(result.data.length).toEqual(1);
    expect(result.data[0]!.name).toEqual("treecko");
  });

  it("should return empty for non-matching filter", () => {
    const result = store.getFeed({ tags: ["dragon"] });

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toEqual(0);
    expect(result.pagination.hasMore).toEqual(false);
  });

  it("should paginate filtered results", () => {
    const page1 = store.getFeed({ tags: ["grass"], limit: 1 });

    expect(page1.data.length).toEqual(1);
    expect(page1.pagination.hasMore).toEqual(true);
    expect(page1.pagination.total).toEqual(3);

    const page2 = store.getFeed({
      tags: ["grass"],
      limit: 1,
      cursor: page1.pagination.nextCursor!,
    });

    expect(page2.data.length).toEqual(1);
    expect(page2.data[0]!.id).not.toEqual(page1.data[0]!.id);
  });

  it("should handle case-insensitive name search", () => {
    const result = store.getFeed({ q: "PIKA" });

    expect(result.data.length).toEqual(1);
    expect(result.data[0]!.name).toEqual("pikachu");
  });
});

describe("getTags", () => {
  it("should return all types with counts", () => {
    const tags = store.getTags();

    expect(tags.types.length).toBeGreaterThan(0);

    const grassTag = tags.types.find((t) => t.name === "grass");
    expect(grassTag?.count).toEqual(3);
  });

  it("should sort types by count descending", () => {
    const tags = store.getTags();

    for (let i = 1; i < tags.types.length; i++) {
      expect(tags.types[i - 1]!.count).toBeGreaterThanOrEqual(
        tags.types[i]!.count,
      );
    }
  });

  it("should return all generations with counts", () => {
    const tags = store.getTags();

    expect(tags.generations.length).toEqual(3);
    expect(tags.generations[0]!.label).toEqual("Gen 1");
  });

  it("should sort generations by number ascending", () => {
    const tags = store.getTags();

    for (let i = 1; i < tags.generations.length; i++) {
      expect(Number(tags.generations[i - 1]!.name)).toBeLessThan(
        Number(tags.generations[i]!.name),
      );
    }
  });

  it("should return cached result (same reference)", () => {
    const tags1 = store.getTags();
    const tags2 = store.getTags();

    expect(tags1).toBe(tags2);
  });
});

describe("edge cases", () => {
  it("should handle empty dataset", () => {
    const emptyStore = new PokemonStore([]);

    expect(emptyStore.getFeed({}).data).toEqual([]);
    expect(emptyStore.getTags().types).toEqual([]);
    expect(emptyStore.getById(1)).toBeUndefined();
  });

  it("should handle single pokemon", () => {
    const singleStore = new PokemonStore([testData[0]!]);
    const result = singleStore.getFeed({});

    expect(result.data.length).toEqual(1);
    expect(result.pagination.hasMore).toEqual(false);
  });

  it("should handle pokemon with multiple types in index", () => {
    const grassResult = store.getFeed({ tags: ["grass"] });
    const poisonResult = store.getFeed({ tags: ["poison"] });

    const grassIds = grassResult.data.map((p) => p.id);
    const poisonIds = poisonResult.data.map((p) => p.id);

    expect(grassIds).toContain(1);
    expect(poisonIds).toContain(1);
  });
});
