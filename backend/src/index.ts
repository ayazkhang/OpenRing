import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import { createApp } from "./app";

dotenv.config();

async function main() {
  const port = Number(process.env.PORT || 4000);

  await AppDataSource.initialize();
  console.log("PostgreSQL connected via TypeORM");

  const { app } = await createApp(AppDataSource);

  app.listen(port, () => {
    console.log(`OpenRing GraphQL API ready at http://localhost:${port}/graphql`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`CSV export: GET http://localhost:${port}/sessions/:id/export`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
