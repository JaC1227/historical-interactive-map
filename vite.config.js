import { defineConfig } from 'vite';
import { ghPages } from "vite-plugin-gh-pages";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/historical-interactive-map/", 
  plugins: [
    ghPages(),
    viteStaticCopy({
      targets: [
        {
          src: "./200ad.geojson",
          dest: ""
        },
        {
          src: "./100ad.geojson",
          dest: ""
        },
        {
          src: "./300ad.geojson",
          dest: ""
        },
        {
          src: "./400ad.geojson",
          dest: ""
        }
      ]
    })
  ],
  build: {
    sourcemap: true,
  },
});
