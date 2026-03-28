import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    exclude: ["dist/**", "node_modules/**", "src/**/*.test.tsx"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
