import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";

export function feedRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/feed", async (request) => {
    const { cursor, limit, tags, generation, q } = request.query as Record<
      string,
      string | undefined
    >;

    return store.getFeed({
      cursor,
      limit: limit ? Number(limit) : undefined,
      tags: tags ? tags.split(",") : undefined,
      generation: generation ? generation.split(",").map(Number) : undefined,
      q,
    });
  });
}
