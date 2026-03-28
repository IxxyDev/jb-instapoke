import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { MAX_POKEMON_ID } from "@instapoke/shared";
import type { Pokemon } from "../schemas/pokemon.js";
import { transformPokemon } from "./transforms.js";
import type { PokeApiPokemon, PokeApiSpecies } from "./types.js";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export async function seed() {
  console.log(`Seeding ${MAX_POKEMON_ID} Pokemon...`);

  const results: Pokemon[] = [];

  for (let i = 0; i < MAX_POKEMON_ID; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, MAX_POKEMON_ID - i) },
      (_, j) => i + j + 1,
    );

    const pokemon = await Promise.all(batch.map(fetchPokemonWithRetry));
    results.push(...pokemon);

    console.log(`Fetched ${results.length}/${MAX_POKEMON_ID}`);

    if (i + BATCH_SIZE < MAX_POKEMON_ID) {
      await delay(BATCH_DELAY_MS);
    }
  }

  const dataDir = resolve(import.meta.dirname, "../../data");
  const dataPath = resolve(dataDir, "pokemon.json");

  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dataPath, JSON.stringify(results, null, 2));

  console.log(`Done! Saved ${results.length} Pokemon to ${dataPath}`);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPokemonWithRetry(id: number): Promise<Pokemon> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchPokemon(id);
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to fetch pokemon ${id} after ${MAX_RETRIES} attempts: ${err}`,
        );
      }
      console.warn(`Retry ${attempt}/${MAX_RETRIES} for pokemon ${id}: ${err}`);
      await delay(RETRY_DELAY_MS * attempt);
    }
  }
  throw new Error("Unreachable");
}

async function fetchPokemon(id: number): Promise<Pokemon> {
  const [pokemon, species] = await Promise.all([
    fetchJson<PokeApiPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchJson<PokeApiSpecies>(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`,
    ),
  ]);

  return transformPokemon(id, pokemon, species);
}
