import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import dotenv from "dotenv";
import {
  Device,
  StudySession,
  SensorBatch,
  SensorReading,
} from "./entities";

dotenv.config();

export function buildDataSourceOptions(
  overrides: Partial<DataSourceOptions> = {}
): DataSourceOptions {
  const isTest = process.env.NODE_ENV === "test";

  return {
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USER || "openring",
    password: process.env.DATABASE_PASSWORD || "openring",
    database:
      process.env.DATABASE_NAME || (isTest ? "openring_test" : "openring"),
    entities: [Device, StudySession, SensorBatch, SensorReading],
    synchronize: true,
    logging: process.env.TYPEORM_LOGGING === "true",
    dropSchema: isTest,
    ...overrides,
  } as DataSourceOptions;
}

export const AppDataSource = new DataSource(buildDataSourceOptions());
