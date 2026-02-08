import type { Pokemon } from "@instapoke/shared";

export function makePokemon(
  overrides: Partial<Pokemon> & { id: number },
): Pokemon {
  return {
    name: `pokemon-${overrides.id}`,
    displayName: `Pokemon ${overrides.id}`,
    spriteUrl: `https://example.com/${overrides.id}.png`,
    types: ["normal"],
    abilities: [],
    generation: 1,
    genus: "",
    description: "",
    stats: {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    },
    color: "white",
    height: 0,
    weight: 0,
    ...overrides,
  };
}
