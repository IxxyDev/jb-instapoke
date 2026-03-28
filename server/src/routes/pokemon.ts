import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";
import { NotFoundError } from "../errors.js";

const PokemonIdSchema = z.object({
  id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null) ? undefined : v,
    z.coerce.number({ message: "id must be a positive integer" }).int({ message: "id must be a positive integer" }).min(1, { message: "id must be a positive integer" }),
  ),
});

export function pokemonRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/pokemon/:id", async (request, reply) => {
    const { id } = PokemonIdSchema.parse(request.params);

    const pokemon = store.getById(id);

    if (!pokemon) {
      throw new NotFoundError("Pokemon not found");
    }

    reply.header("Cache-Control", "public, max-age=3600");
    return pokemon;
  });
}
