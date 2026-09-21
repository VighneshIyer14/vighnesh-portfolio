import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every project is one Markdown file in src/content/projects/.
// Pages CMS (app.pagescms.org) creates and edits these files for you.
// Empty fields saved by the CMS (null) fall back to the defaults below.
const nz = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((v) => (v === null ? undefined : v), schema);
const str = nz(z.coerce.string().optional().default(''));
const strList = nz(z.array(z.coerce.string()).optional().default([]));

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    discipline: nz(z.enum(['UI/UX Design', '3D Modeling', 'Graphic Design']).default('UI/UX Design')),
    category: z.string(),
    year: str,
    role: str,
    tools: strList,
    tags: strList,
    cover: z.string(),
    gallery: nz(
      z
        .array(z.object({ image: z.string(), caption: str }))
        .optional()
        .default([]),
    ),
    link: str,
    featured: nz(z.boolean().optional().default(false)),
    order: nz(z.coerce.number().optional().default(100)),
    draft: nz(z.boolean().optional().default(false)),
  }),
});

export const collections = { projects };
