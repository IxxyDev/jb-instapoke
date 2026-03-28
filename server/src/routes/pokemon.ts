import type { FastifyInstance } from "fastify";
import { NotFoundError, ValidationError } from "../errors.js";
import type { PokemonStore } from "../store/pokemon-store.js";

export function pokemonRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/pokemon/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const numId = Number(id);

    if (!Number.isFinite(numId) || !Number.isInteger(numId) || numId < 1) {
      throw new ValidationError("id must be a positive integer");
    }

    const pokemon = store.getById(numId);

    if (!pokemon) {
      throw new NotFoundError("Pokemon not found");
    }

    reply.header("Cache-Control", "public, max-age=3600");
    return pokemon;
  });
}
