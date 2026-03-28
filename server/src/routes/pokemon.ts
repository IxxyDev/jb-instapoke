import type { FastifyInstance } from "fastify";
import { NotFoundError } from "../errors.js";
import { PokemonIdSchema } from "../schemas/pokemon.js";
import type { PokemonStore } from "../store/pokemon-store.js";

export function pokemonRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get(
    "/api/pokemon/:id",
    {
      schema: {
        params: { $ref: "PokemonId#" },
        response: {
          200: { $ref: "Pokemon#" },
          404: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      const { id } = PokemonIdSchema.parse(request.params);
      const pokemon = store.getById(id);
      if (!pokemon) {
        throw new NotFoundError("Pokemon not found");
      }
      reply.header("Cache-Control", "public, max-age=3600");
      return pokemon;
    },
  );
}
