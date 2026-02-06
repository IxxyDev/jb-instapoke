import { writeFileSync, mkdirSync } from "node:fs";

import { SPRITE_BASE_URL, MAX_POKEMON_ID } from "@instapoke/shared";
import type { Pokemon, PokemonStats } from "@instapoke/shared";

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;

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

interface PokeApiPokemon {
  name: string;
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
  stats: Array<{ stat: { name: string }; base_stat: number }>;
  height: number;
  weight: number;
}

interface PokeApiSpecies {
  generation: { name: string };
  genera: Array<{ genus: string; language: { name: string } }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  color: { name: string };
  names: Array<{ name: string; languange: { name: string } }>;
}

function parseGeneration(name: string): number {
  const match = name.match(/generation-(\w+)/);
  if (!match?.[1]) {
    return 0;
  }

  const romans: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };
  return romans[match[1]] ?? 0;
}

function parseStats(stats: PokeApiPokemon["stats"]): PokemonStats {
  const get = (name: string) =>
    stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

  return {
    hp: get("hp"),
    attack: get("attack"),
    defense: get("defense"),
    specialAttack: get("special-attack"),
    specialDefense: get("special-defense"),
    speed: get("speed"),
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchPokemon(id: number): Promise<Pokemon> {
  const [pokemon, species] = await Promise.all([
    fetchJson<PokeApiPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchJson<PokeApiSpecies>(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`,
    ),
  ]);

  const genus =
    species.genera.find((genera) => genera.language.name === "en")?.genus ?? "";
  const description =
    species.flavor_text_entries
      .find((entry) => entry.language.name === "en")
      ?.flavor_text.replace(/\f|\n/g, " ") ?? "";
  const displayName =
    species.names.find((name) => name.languange.name === "en")?.name ??
    capitalize(pokemon.name);

  return {
    id,
    name: pokemon.name,
    displayName,
    spriteUrl: `${SPRITE_BASE_URL}/${id}.png`,
    types: pokemon.types.map((t) => t.type.name),
    abilities: pokemon.abilities.map((a) => a.ability.name),
    generation: parseGeneration(species.generation.name),
    genus,
    description,
    stats: parseStats(pokemon.stats),
    color: species.color.name,
    height: pokemon.height,
    weight: pokemon.weight,
  };
}

async function seed() {
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

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
