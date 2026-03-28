import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";

export function tagsRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get(
    "/api/tags",
    {
      schema: {
        response: {
          200: { $ref: "TagsResponse#" },
        },
      },
    },
    async (_request, reply) => {
      reply.header("Cache-Control", "public, max-age=3600");
      return store.getTags();
    },
  );
}
