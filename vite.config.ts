import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: 'docs',
    emptyOutDir: false,
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
