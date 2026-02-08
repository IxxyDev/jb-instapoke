import { buildApp } from "./app.js";

const PORT = Number(process.env["PORT"] ?? 3001);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`Invalid PORT: ${process.env["PORT"]}`);
  process.exit(1);
}

async function main() {
  const app = await buildApp();

  await app.listen({ port: PORT, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
