import { writeFileSync, mkdirSync } from "node:fs";
import { MAX_POKEMON_ID } from "@instapoke/shared";
import type { Pokemon } from "@instapoke/shared";
import type { PokeApiPokemon, PokeApiSpecies } from "./types.js";
import { transformPokemon } from "./transforms.js";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;

export async function seed() {
  console.log(`Seeding ${MAX_POKEMON_ID} Pokemon...`);

  const results: Pokemon[] = [];

  for (let i = 0; i < MAX_POKEMON_ID; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, MAX_POKEMON_ID - i) },
      (_, j) => i + j + 1,
    );

    const pokemon = await Promise.all(batch.map(fetchPokemon));
    results.push(...pokemon);

    console.log(`Fetched ${results.length}/${MAX_POKEMON_ID}`);

    if (i + BATCH_SIZE < MAX_POKEMON_ID) {
      await delay(BATCH_DELAY_MS);
    }
  }

  mkdirSync("data", { recursive: true });
  writeFileSync("data/pokemon.json", JSON.stringify(results, null, 2));

  console.log(`Done! Saved ${results.length} Pokemon to data/pokemon.json`);
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

async function fetchPokemon(id: number): Promise<Pokemon> {
  const [pokemon, species] = await Promise.all([
    fetchJson<PokeApiPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchJson<PokeApiSpecies>(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`,
    ),
  ]);

  return transformPokemon(id, pokemon, species);
}
