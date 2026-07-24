import "reflect-metadata";
import { printSchema } from "graphql";
import { promises as fs } from "fs";
import path from "path";
import { buildAppSchema } from "../src/graphql/schema";

async function main() {
  const schema = await buildAppSchema();
  const sdl = printSchema(schema);
  const outPath = path.resolve(
    __dirname,
    "../../frontend/graphql/schema.graphql"
  );
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, sdl, "utf8");
  console.log(`Wrote GraphQL schema to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
