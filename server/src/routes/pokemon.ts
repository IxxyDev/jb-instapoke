import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";

export function pokemonRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/pokemon/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const pokemon = store.getById(Number(id));

    if (!pokemon) {
      return reply.status(404).send({ error: "Pokemon not found" });
    }

    return pokemon;
  });
}
