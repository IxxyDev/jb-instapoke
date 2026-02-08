import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";

export function tagsRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/tags", async () => {
    return store.getTags();
  });
}
