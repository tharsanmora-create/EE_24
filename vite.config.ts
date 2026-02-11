
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/EE_24/",
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  // For GitHub Pages SPA routing, 404.html is handled in postbuild script
});
