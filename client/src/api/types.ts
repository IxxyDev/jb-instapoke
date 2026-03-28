import type { components } from "./schema";

export type Pokemon = components["schemas"]["def-0"];
export type PokemonStats = Pokemon["stats"];
export type PaginatedResponse = components["schemas"]["def-1"];
export type TagsResponse = components["schemas"]["def-2"];
export type TagInfo = TagsResponse["types"][number];
