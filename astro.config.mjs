// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Update if the domain ends up being different from emilioparra.dev.
  site: 'https://emilioparra.dev',
  vite: {
    plugins: [tailwindcss()]
  },

  // Code blocks take their colours from the site tokens (global.css), so they follow the theme toggle.
  markdown: {
    shikiConfig: { theme: 'css-variables' }
  },

  integrations: [mdx(), sitemap()]
});
