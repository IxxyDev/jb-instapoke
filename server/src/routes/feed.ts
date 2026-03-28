import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";

const FeedQuerySchema = z.object({
  q: z.preprocess(
    (v) => (typeof v === "string" && v.trim()) || undefined,
    z.string().trim().max(100, { message: "Search query too long (max 100 characters)" }).optional(),
  ),
  tags: z.preprocess(
    (v) => Array.isArray(v) ? v : typeof v === "string" && v ? v.split(",").filter(Boolean) : undefined,
    z.array(z.string()).max(20, { message: "Too many tags (max 20)" }).optional(),
  ),
  generation: z.preprocess(
    (v) => Array.isArray(v) ? v.map(Number) : typeof v === "string" && v ? v.split(",").filter(Boolean).map(Number) : undefined,
    z.array(z.number({ message: "generation must be a positive integer" }).int({ message: "generation must be a positive integer" }).min(1, { message: "generation must be a positive integer" })).max(20, { message: "Too many generation filters (max 20)" }).optional(),
  ),
  limit: z.preprocess(
    (v) => (v === "" || v === undefined || v === null) ? undefined : v,
    z.coerce.number({ message: "limit must be an integer" }).int({ message: "limit must be an integer" }).min(1, { message: "limit must be at least 1" }).max(50).optional(),
  ),
  cursor: z.string().optional(),
  direction: z.enum(["forward", "backward"], { message: "direction must be 'forward' or 'backward'" }).optional(),
});

export function feedRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/feed", async (request, reply) => {
    const params = FeedQuerySchema.parse(request.query);

    const result = store.getFeed({
      cursor: params.cursor,
      direction: params.direction,
      limit: params.limit,
      tags: params.tags,
      generation: params.generation,
      q: params.q,
    });
    reply.header("Cache-Control", "public, max-age=60");
    return result;
  });
}
