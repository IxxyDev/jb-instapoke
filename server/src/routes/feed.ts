import type { FastifyInstance } from "fastify";
import type { PokemonStore } from "../store/pokemon-store.js";
import { ValidationError } from "../errors.js";

const MAX_TAGS = 20;
const MAX_QUERY_LENGTH = 100;

export function feedRoutes(app: FastifyInstance, store: PokemonStore) {
  app.get("/api/feed", async (request) => {
    const raw = request.query as Record<string, unknown>;

    const cursor = asString(raw["cursor"]);
    const direction = parseDirection(asString(raw["direction"]));
    const limit = parseLimit(asString(raw["limit"]));
    const tags = parseTags(asString(raw["tags"]));
    const generation = parseGeneration(asString(raw["generation"]));
    const q = parseQuery(asString(raw["q"]));

    return store.getFeed({ cursor, direction, limit, tags, generation, q });
  });
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

function parseLimit(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new ValidationError("limit must be an integer");
  }
  if (n < 1) {
    throw new ValidationError("limit must be at least 1");
  }
  return n;
}

function parseTags(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined;
  const tags = raw.split(",").filter(Boolean);
  if (tags.length > MAX_TAGS) {
    throw new ValidationError(`Too many tags (max ${MAX_TAGS})`);
  }
  return tags.length > 0 ? tags : undefined;
}

function parseGeneration(raw: string | undefined): number[] | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",").filter(Boolean);
  if (parts.length > MAX_TAGS) {
    throw new ValidationError(`Too many generation filters (max ${MAX_TAGS})`);
  }
  const nums = parts.map((s) => {
    const n = Number(s);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
      throw new ValidationError("generation must be a positive integer");
    }
    return n;
  });
  return nums.length > 0 ? nums : undefined;
}

function parseDirection(
  raw: string | undefined,
): "forward" | "backward" | undefined {
  if (!raw) return undefined;
  if (raw !== "forward" && raw !== "backward") {
    throw new ValidationError("direction must be 'forward' or 'backward'");
  }
  return raw;
}

function parseQuery(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_QUERY_LENGTH) {
    throw new ValidationError(
      `Search query too long (max ${MAX_QUERY_LENGTH} characters)`,
    );
  }
  return trimmed;
}
