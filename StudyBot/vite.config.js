import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@xenova/transformers"],
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/studybot.logic.js"],
      thresholds: {
        lines: 90,
        functions: 100,
        branches: 80,
      },
    },
  },
});
