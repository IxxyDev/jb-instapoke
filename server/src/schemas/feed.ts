import { z } from "zod";

export const FeedQuerySchema = z.object({
  q: z.preprocess(
    (v) => (typeof v === "string" && v.trim()) || undefined,
    z
      .string()
      .trim()
      .max(100, { message: "Search query too long (max 100 characters)" })
      .optional(),
  ),
  tags: z.preprocess(
    (v) =>
      Array.isArray(v)
        ? v
        : typeof v === "string" && v
          ? v.split(",").filter(Boolean)
          : undefined,
    z
      .array(z.string())
      .max(20, { message: "Too many tags (max 20)" })
      .optional(),
  ),
  generation: z.preprocess(
    (v) =>
      Array.isArray(v)
        ? v.map(Number)
        : typeof v === "string" && v
          ? v.split(",").filter(Boolean).map(Number)
          : undefined,
    z
      .array(
        z
          .number({ message: "generation must be a positive integer" })
          .int({ message: "generation must be a positive integer" })
          .min(1, { message: "generation must be a positive integer" }),
      )
      .max(20, { message: "Too many generation filters (max 20)" })
      .optional(),
  ),
  limit: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce
      .number({ message: "limit must be an integer" })
      .int({ message: "limit must be an integer" })
      .min(1, { message: "limit must be at least 1" })
      .max(50)
      .optional(),
  ),
  cursor: z.string().optional(),
  direction: z
    .enum(["forward", "backward"], {
      message: "direction must be 'forward' or 'backward'",
    })
    .optional(),
});

// Wire-format doc schema for OpenAPI documentation.
// Permissive for AJV (Zod does the real validation), but descriptive for OpenAPI docs.
export const FeedQueryDocSchema = {
  $id: "FeedQuery",
  type: "object" as const,
  properties: {
    q: { type: "string" as const, description: "Search query (max 100 chars)" },
    tags: {
      anyOf: [
        { type: "string" as const },
        { type: "array" as const, items: { type: "string" as const } },
      ],
      description: "Comma-separated type names (or repeated query params)",
    },
    generation: {
      anyOf: [
        { type: "string" as const },
        { type: "array" as const, items: { type: "string" as const } },
      ],
      description:
        "Comma-separated generation numbers (or repeated query params)",
    },
    limit: { type: "string" as const, description: "Page size (1-50)" },
    cursor: { type: "string" as const },
    direction: { type: "string" as const, enum: ["forward", "backward"] },
  },
};

export type FeedQuery = z.infer<typeof FeedQuerySchema>;
