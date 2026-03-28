import cors from "@fastify/cors";
import Fastify from "fastify";
import { AppError } from "./errors.js";
import { feedRoutes } from "./routes/feed.js";
import { pokemonRoutes } from "./routes/pokemon.js";
import { tagsRoutes } from "./routes/tags.js";
import type { PokemonStore } from "./store/pokemon-store.js";
import { loadStore } from "./store/pokemon-store.js";

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

  app.setErrorHandler((error: unknown, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    let statusCode = 500;
    let message = "Internal server error";

    if (error instanceof Error) {
      if ("statusCode" in error && typeof error.statusCode === "number") {
        statusCode = error.statusCode;
      }
      if (statusCode < 500) {
        message = error.message;
      }
    }

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
