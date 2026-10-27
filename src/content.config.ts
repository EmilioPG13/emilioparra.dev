import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.url() });

// Case studies. Files starting with `_` (the template) are not published.
// Every figure carries the place it comes from and the conditions it was
// measured in, so nothing unverified can reach the page: a fact without a
// source fails the build.
const projects = defineCollection({
  loader: glob({ pattern: '**/[!_]*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One sentence; also the meta description. */
    summary: z.string().max(200),
    order: z.number(),
    line: z.enum(['red', 'blue', 'amber', 'brown']),
    links: z.array(link).default([]),
    facts: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          /** Where and how it was measured, when the number needs it. */
          context: z.string().optional(),
          source: link,
        }),
      )
      .default([]),
  }),
});

// Stays empty until there is a finished article (Phase 4).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
