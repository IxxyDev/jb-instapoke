import Fastify from "fastify";
import cors from "@fastify/cors";

import { feedRoutes } from "./routes/feed";
import { tagsRoutes } from "./routes/tags";
import { pokemonRoutes } from "./routes/pokemon";
import { PokemonStore, loadStore } from "./store/pokemon-store";
import { AppError } from "./errors";

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

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    const statusCode = error.statusCode ?? 500;
    const message = statusCode >= 500 ? "Internal server error" : error.message;
    return reply.status(statusCode).send({ error: message });
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
