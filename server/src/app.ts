import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { ZodError, z } from "zod";
import { AppError } from "./errors.js";
import { feedRoutes } from "./routes/feed.js";
import { pokemonRoutes } from "./routes/pokemon.js";
import { tagsRoutes } from "./routes/tags.js";
import { FeedQueryDocSchema } from "./schemas/feed.js";
import {
  ErrorResponseSchema,
  PaginatedResponseSchema,
  PokemonIdDocSchema,
  PokemonSchema,
} from "./schemas/pokemon.js";
import { TagsResponseSchema } from "./schemas/tags.js";
import type { PokemonStore } from "./store/pokemon-store.js";
import { loadStore } from "./store/pokemon-store.js";

export interface AppOptions {
  store?: PokemonStore;
  logger?: boolean;
}

function zodToOpenApi(schema: z.ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "openApi3" });
  return jsonSchema as Record<string, unknown>;
}

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  await app.register(cors, {
    origin: true,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "InstaPoke API",
        version: "1.0.0",
      },
    },
  });

  if (process.env.NODE_ENV !== "production") {
    await app.register(swaggerUi, {
      routePrefix: "/api/docs",
    });
  }

  // Register schemas for $ref usage in routes
  app.addSchema({ $id: "Pokemon", ...zodToOpenApi(PokemonSchema) });
  app.addSchema({
    $id: "PaginatedResponse",
    ...zodToOpenApi(PaginatedResponseSchema),
  });
  app.addSchema({ $id: "TagsResponse", ...zodToOpenApi(TagsResponseSchema) });
  app.addSchema({ $id: "ErrorResponse", ...zodToOpenApi(ErrorResponseSchema) });
  app.addSchema(FeedQueryDocSchema);
  app.addSchema(PokemonIdDocSchema);

  app.setErrorHandler((error: unknown, _request, reply) => {
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send({ error: error.issues[0]?.message ?? "Validation error" });
    }

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
