import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import { buildApp } from "../server/src/app.js";
import { PokemonStore } from "../server/src/store/pokemon-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const app = await buildApp({ logger: false, store: new PokemonStore([]) });
  await app.ready();
  const spec = app.swagger();
  await app.close();
  const ast = await openapiTS(spec as Record<string, unknown>);
  const output = astToString(ast);
  const outPath = resolve(__dirname, "../client/src/api/schema.d.ts");
  writeFileSync(outPath, output);
  console.log(`Generated ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
