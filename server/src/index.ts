import { buildApp } from "./index.js";

const PORT = process.env["PORT"] ?? 3001;

async function main() {
  const app = await buildApp();

  await app.listen({ port: Number(PORT), host: "0.0.0.0" });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
