import Fastify from "fastify";
import cors from "@fastify/cors";

import { feedRoutes } from "./routes/feed";
import { tagsRoutes } from "./routes/tags";
import { pokemonRoutes } from "./routes/pokemon";
import { PokemonStore, loadStore } from "./store/pokemon-store";

export interface AppOptions {
  store?: PokemonStore;
  logger?: boolean;
}

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  await app.register(cors, {
    origin: true,
  });

  const store = options.store ?? (await loadStore());

  feedRoutes(app, store);
  tagsRoutes(app, store);
  pokemonRoutes(app, store);

  app.get("/api/health", async () => {
    return { status: "ok" };
  });

  return app;
}
