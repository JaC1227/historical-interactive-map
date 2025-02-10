import { defineConfig } from 'vite';
import { ghPages } from "vite-plugin-gh-pages"; 

export default defineConfig({
  base: "/historical-interactive-map/", 
  plugins: [ghPages()],   
  build: {
    sourcemap: true,
  },
});
