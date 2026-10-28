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
          /** Shown in the signage band too, so the proof is on the first screen. */
          headline: z.boolean().default(false),
          source: link,
        }),
      )
      .default([]),
  }),
});

export const collections = { projects };
