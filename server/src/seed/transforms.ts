import type { Pokemon, PokemonStats } from "@instapoke/shared";
import { SPRITE_BASE_URL } from "@instapoke/shared";
import type { PokeApiPokemon, PokeApiSpecies } from "./types.js";

export function parseGeneration(name: string): number {
  const match = name.match(/generation-(\w+)/);
  if (!match?.[1]) return 0;
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

export function parseStats(stats: PokeApiPokemon["stats"]): PokemonStats {
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

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function transformPokemon(
  id: number,
  pokemon: PokeApiPokemon,
  species: PokeApiSpecies,
): Pokemon {
  const genus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "";
  const description =
    species.flavor_text_entries
      .find((e) => e.language.name === "en")
      ?.flavor_text.replace(/\f|\n/g, " ") ?? "";
  const displayName =
    species.names.find((n) => n.language.name === "en")?.name ??
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
