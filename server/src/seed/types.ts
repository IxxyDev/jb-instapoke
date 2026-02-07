export interface PokeApiPokemon {
  name: string;
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
  stats: Array<{ stat: { name: string }; base_stat: number }>;
  height: number;
  weight: number;
}

export interface PokeApiSpecies {
  generation: { name: string };
  genera: Array<{ genus: string; language: { name: string } }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  color: { name: string };
  names: Array<{ name: string; language: { name: string } }>;
}
