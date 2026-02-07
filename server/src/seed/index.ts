import { seed } from "./seed.js";

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
