import express, { Express, Request, Response } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { DataSource } from "typeorm";
import { buildAppSchema } from "./graphql/schema";
import { createServices, MyContext } from "./graphql/context";

export async function createApp(ds: DataSource): Promise<{
  app: Express;
  apollo: ApolloServer<MyContext>;
  services: ReturnType<typeof createServices>;
}> {
  const services = createServices(ds);
  const schema = await buildAppSchema();

  const apollo = new ApolloServer<MyContext>({
    schema,
  });
  await apollo.start();

  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.get(
    "/sessions/:sessionId/export",
    async (req: Request, res: Response) => {
      try {
        const csv = await services.sync.exportSessionCsv(req.params.sessionId);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="session-${req.params.sessionId}.csv"`
        );
        res.send(csv);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed";
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "EXPORT_ERROR";
        const status =
          err && typeof err === "object" && "statusCode" in err
            ? Number((err as { statusCode: number }).statusCode)
            : 400;
        res.status(status).json({ error: message, code });
      }
    }
  );

  app.use(
    "/graphql",
    expressMiddleware(apollo, {
      context: async (): Promise<MyContext> => ({ services, dataSource: ds }),
    })
  );

  return { app, apollo, services };
}
