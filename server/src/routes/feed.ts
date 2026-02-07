import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";
import { ValidationError } from "../errors.js";

export function feedRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/feed", async (request) => {
    const { cursor, limit, tags, generation, q } = request.query as Record<
      string,
      string | undefined
    >;

    const parsedLimit = parseLimit(limit);
    const parsedGeneration = parseGeneration(generation);

    return store.getFeed({
      cursor,
      limit: parsedLimit,
      tags: tags ? tags.split(",").filter(Boolean) : undefined,
      generation: parsedGeneration,
      q: q?.trim() || undefined,
    });
  });
}

function parseLimit(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new ValidationError("limit must be an integer");
  }
  return n;
}

function parseGeneration(raw: string | undefined): number[] | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",").filter(Boolean);
  const nums = parts.map((s) => {
    const n = Number(s);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
      throw new ValidationError(`Invalid generation: ${s}`);
    }
    return n;
  });
  return nums.length > 0 ? nums : undefined;
}
