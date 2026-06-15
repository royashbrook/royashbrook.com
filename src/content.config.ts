import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// the ported jekyll posts. id comes from filename; the real url is data.path
// (/:year/:month/:day/:title/), preserved from the old site.
const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    path: z.string(),
  }),
});

export const collections = { posts };
