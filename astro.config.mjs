import { defineConfig } from 'astro/config';

// royashbrook.com, modernized off the old jekyll site.
// urls preserved at /:year/:month/:day/:title/ so the 18 years of posts keep working.
export default defineConfig({
  site: 'https://royashbrook.com',
  trailingSlash: 'always',
});
