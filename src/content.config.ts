import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const baseSchema = z.object({
  title: z.string(),
  h1: z.string().optional(),
  slug: z.string(),
  description: z.string(),
  mainKeyword: z.string(),
  relatedKeywords: z.array(z.string()).default([]),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  ogImage: z.string().optional(),
  heroImage: z.string().optional(),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: baseSchema.extend({
    icon: z.string().optional(),
    order: z.number().optional(),
    faqs: z.array(faqItemSchema).default([]),
    quickSummary: z.array(z.string()).optional(),
  }),
});

const areas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/areas' }),
  schema: baseSchema.extend({
    province: z.string(),
    faqs: z.array(faqItemSchema).default([]),
  }),
});

const serviceAreas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/serviceAreas' }),
  schema: baseSchema.extend({
    serviceSlug: z.string(),
    areaSlug: z.string(),
    faqs: z.array(faqItemSchema).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: baseSchema.extend({
    author: z.string().default('Amphon'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { services, areas, serviceAreas, blog };
