import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    slug: z.string(),
    language: z.enum(["en", "ja"]),
    topic: z.string(),
    draft: z.boolean(),
    coverImage: z.string().optional(),
    featured: z.boolean().default(false),
    repositoryUrl: z.url().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    slug: z.string(),
    technologies: z.array(z.string()).min(1),
    featured: z.boolean(),
    order: z.number().int().nonnegative(),
    repositoryUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    coverImage: z.string().optional(),
    year: z.number().int().optional(),
  }),
});

export const collections = { writing, projects };
