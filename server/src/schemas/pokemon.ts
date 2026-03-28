import { z } from "zod";

export const PokemonStatsSchema = z.object({
  hp: z.number(),
  attack: z.number(),
  defense: z.number(),
  specialAttack: z.number(),
  specialDefense: z.number(),
  speed: z.number(),
});

export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  displayName: z.string(),
  spriteUrl: z.string(),
  types: z.array(z.string()),
  abilities: z.array(z.string()),
  generation: z.number(),
  genus: z.string(),
  description: z.string(),
  stats: PokemonStatsSchema,
  color: z.string(),
  height: z.number(),
  weight: z.number(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(PokemonSchema),
  pagination: z.object({
    nextCursor: z.string().nullable(),
    previousCursor: z.string().nullable(),
    hasMore: z.boolean(),
    hasPrevious: z.boolean(),
    total: z.number(),
  }),
});

export const PokemonIdSchema = z.object({
  id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce
      .number({ message: "id must be a positive integer" })
      .int({ message: "id must be a positive integer" })
      .min(1, { message: "id must be a positive integer" }),
  ),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Wire-format doc schema for OpenAPI docs.
// Permissive for AJV (Zod does the real validation via PokemonIdSchema).
export const PokemonIdDocSchema = {
  $id: "PokemonId",
  type: "object" as const,
  properties: {
    id: {
      type: "string" as const,
      description: "Pokemon ID (positive integer)",
    },
  },
  required: ["id"],
};

// Inferred types for server use
export type Pokemon = z.infer<typeof PokemonSchema>;
export type PokemonStats = z.infer<typeof PokemonStatsSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
