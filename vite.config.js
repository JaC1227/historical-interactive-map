import { defineConfig } from 'vite';
import { ghPages } from "vite-plugin-gh-pages";
import copy from "vite=plugin-copy"; 

// Use dynamic import for vite-plugin-copy
const VitePluginCopy = await import('vite-plugin-copy');

export default defineConfig({
  base: "/historical-interactive-map/", 
  plugins: [
    ghPages(),
    copy([
      { src: "./borders_117AD.geojson" }
    ])
  ],
  build: {
    sourcemap: true,
  },
});
