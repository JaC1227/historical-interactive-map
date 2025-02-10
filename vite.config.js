import { defineConfig } from 'vite';
import { ghPages } from "vite-plugin-gh-pages"; 
import VitePluginCopy from 'vite-plugin-copy';

export default defineConfig({
  base: "/historical-interactive-map/", 
  plugins: [
    ghPages(),
    VitePluginCopy({
      targets: [
        {
          src: 'borders_117AD.geojson', // Update with the actual path to your GeoJSON file
          dest: 'dist', // Copy it to the root of dist
        },
      ],
    }),
  ],
  build: {
    sourcemap: true,
  },
});
