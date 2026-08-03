import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  base: "./",
  server: {
    port: 43303
  }
});
