import { defineConfig } from "vite";

export default defineConfig({
  build: { outDir: 'docs' },
  base: "/hypersyn-chord-helper/", // Use relative paths for all assets
  server: {
    port: 43303
  },
  resolve: {
    alias: {
      'human-engine': require('path').resolve(__dirname, '../human-midi/docs/human-engine.js')
    }
  }
});
