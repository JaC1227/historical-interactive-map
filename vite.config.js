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
          src: "./borders_117AD.geojson",
          dest: ""                      
        }
      ]
    })
  ],
  build: {
    sourcemap: true,
  },
});
