import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

process.env.NODE_ENV = "test";
process.env.DATABASE_NAME = process.env.DATABASE_NAME_TEST || "openring_test";
