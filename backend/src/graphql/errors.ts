import { GraphQLError } from "graphql";
import { AppError } from "../services/DeviceService";

export function mapAppError(err: unknown): never {
  if (err instanceof AppError) {
    throw new GraphQLError(err.message, {
      extensions: { code: err.code, http: { status: err.statusCode } },
    });
  }
  throw err;
}
