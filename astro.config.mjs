import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeRaw from 'rehype-raw';

export default defineConfig({
  site: 'https://berryberrybin.github.io',
  base: '/notion-blog/',
  integrations: [
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    rehypePlugins: [rehypeRaw],
  },
  output: 'static',
});
