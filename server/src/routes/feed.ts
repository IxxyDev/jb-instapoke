import type { FastifyInstance } from "fastify";
import { FeedQuerySchema } from "../schemas/feed.js";
import type { PokemonStore } from "../store/pokemon-store.js";

export function feedRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get(
    "/api/feed",
    {
      schema: {
        querystring: { $ref: "FeedQuery#" },
        response: {
          200: { $ref: "PaginatedResponse#" },
          400: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
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
    },
  );
}
