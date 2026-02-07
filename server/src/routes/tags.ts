import { FastifyInstance } from "fastify";
import { PokemonStore } from "../store/pokemon-store";

export function tagsRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/tags", async () => {
    return store.getTags();
  });
}
