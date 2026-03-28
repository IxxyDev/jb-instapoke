import { z } from "zod";

export const TagInfoSchema = z.object({
  name: z.string(),
  count: z.number(),
  label: z.string().optional(),
});

export const TagsResponseSchema = z.object({
  types: z.array(TagInfoSchema),
  generations: z.array(TagInfoSchema),
});

export type TagInfo = z.infer<typeof TagInfoSchema>;
export type TagsResponse = z.infer<typeof TagsResponseSchema>;
