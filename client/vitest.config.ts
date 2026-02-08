import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    exclude: ["dist/**", "node_modules/**", "src/**/*.test.tsx"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
