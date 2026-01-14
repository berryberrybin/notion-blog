import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.string().nullable(),
    updatedAt: z.string(),
    createdAt: z.string(),
    number: z.number(),
  }),
});

export const collections = { posts };
