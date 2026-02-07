import {
  parseGeneration,
  parseStats,
  capitalize,
  transformPokemon,
} from "../seed/transforms.js";
import type { PokeApiPokemon, PokeApiSpecies } from "../seed/types.js";
import { SPRITE_BASE_URL } from "@instapoke/shared";

describe("parseGeneration", () => {
  it("should parse all 9 generations", () => {
    expect(parseGeneration("generation-i")).toEqual(1);
    expect(parseGeneration("generation-v")).toEqual(5);
    expect(parseGeneration("generation-ix")).toEqual(9);
  });

  it("should return 0 for invalid input", () => {
    expect(parseGeneration("")).toEqual(0);
    expect(parseGeneration("something-else")).toEqual(0);
    expect(parseGeneration("generation-")).toEqual(0);
  });

  it("should return 0 for unknown roman numeral", () => {
    expect(parseGeneration("generation-xxx")).toEqual(0);
  });
});

describe("parseStats", () => {
  it("should parse all 6 stats", () => {
    const input = [
      { stat: { name: "hp" }, base_stat: 35 },
      { stat: { name: "attack" }, base_stat: 55 },
      { stat: { name: "defense" }, base_stat: 40 },
      { stat: { name: "special-attack" }, base_stat: 50 },
      { stat: { name: "special-defense" }, base_stat: 50 },
      { stat: { name: "speed" }, base_stat: 90 },
    ];

    expect(parseStats(input)).toEqual({
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    });
  });

  it("should default to 0 for missing stats", () => {
    const result = parseStats([]);

    expect(result.hp).toEqual(0);
    expect(result.attack).toEqual(0);
    expect(result.speed).toEqual(0);
  });

  it("should handle partial stats", () => {
    const input = [{ stat: { name: "hp" }, base_stat: 100 }];

    const result = parseStats(input);
    expect(result.hp).toEqual(100);
    expect(result.attack).toEqual(0);
  });
});

describe("capitalize", () => {
  it("should capitalize first letter", () => {
    expect(capitalize("pikachu")).toEqual("Pikachu");
  });

  it("should handle single character", () => {
    expect(capitalize("a")).toEqual("A");
  });

  it("should handle empty string", () => {
    expect(capitalize("")).toEqual("");
  });

  it("should keep already capitalized", () => {
    expect(capitalize("Pikachu")).toEqual("Pikachu");
  });
});

describe("transformPokemon", () => {
  const pokemonData: PokeApiPokemon = {
    name: "pikachu",
    types: [{ type: { name: "electric" } }],
    abilities: [
      { ability: { name: "static" } },
      { ability: { name: "lightning-rod" } },
    ],
    stats: [
      { stat: { name: "hp" }, base_stat: 35 },
      { stat: { name: "attack" }, base_stat: 55 },
      { stat: { name: "defense" }, base_stat: 40 },
      { stat: { name: "special-attack" }, base_stat: 50 },
      { stat: { name: "special-defense" }, base_stat: 50 },
      { stat: { name: "speed" }, base_stat: 90 },
    ],
    height: 4,
    weight: 60,
  };

  const speciesData: PokeApiSpecies = {
    generation: { name: "generation-i" },
    genera: [
      { genus: "ねずみポケモン", language: { name: "ja" } },
      { genus: "Mouse Pokémon", language: { name: "en" } },
    ],
    flavor_text_entries: [
      {
        flavor_text: "When several of\nthese POKéMON\fgather...",
        language: { name: "en" },
      },
    ],
    color: { name: "yellow" },
    names: [
      { name: "ピカチュウ", language: { name: "ja" } },
      { name: "Pikachu", language: { name: "en" } },
    ],
  };

  it("should transform PokeAPI data into Pokemon", () => {
    const result = transformPokemon(25, pokemonData, speciesData);

    expect(result).toEqual({
      id: 25,
      name: "pikachu",
      displayName: "Pikachu",
      spriteUrl: `${SPRITE_BASE_URL}/25.png`,
      types: ["electric"],
      abilities: ["static", "lightning-rod"],
      generation: 1,
      genus: "Mouse Pokémon",
      description: "When several of these POKéMON gather...",
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
      color: "yellow",
      height: 4,
      weight: 60,
    });
  });

  it("should clean line breaks from description", () => {
    const result = transformPokemon(25, pokemonData, speciesData);

    expect(result.description).not.toContain("\n");
    expect(result.description).not.toContain("\f");
  });

  it("should handle missing English genus", () => {
    const noEnglish: PokeApiSpecies = {
      ...speciesData,
      genera: [{ genus: "ねずみポケモン", language: { name: "ja" } }],
    };

    expect(transformPokemon(25, pokemonData, noEnglish).genus).toEqual("");
  });

  it("should handle missing English description", () => {
    const noDescription: PokeApiSpecies = {
      ...speciesData,
      flavor_text_entries: [],
    };

    expect(
      transformPokemon(25, pokemonData, noDescription).description,
    ).toEqual("");
  });

  it("should fallback to capitalized name if English name missing", () => {
    const noEnglishName: PokeApiSpecies = {
      ...speciesData,
      names: [{ name: "ピカチュウ", language: { name: "ja" } }],
    };

    expect(
      transformPokemon(25, pokemonData, noEnglishName).displayName,
    ).toEqual("Pikachu");
  });

  it("should handle dual-type Pokemon", () => {
    const dualType: PokeApiPokemon = {
      ...pokemonData,
      types: [{ type: { name: "fire" } }, { type: { name: "flying" } }],
    };

    expect(transformPokemon(6, dualType, speciesData).types).toEqual([
      "fire",
      "flying",
    ]);
  });

  it("should handle Pokemon with no abilities", () => {
    const noAbilities: PokeApiPokemon = {
      ...pokemonData,
      abilities: [],
    };

    expect(transformPokemon(25, noAbilities, speciesData).abilities).toEqual(
      [],
    );
  });
});
