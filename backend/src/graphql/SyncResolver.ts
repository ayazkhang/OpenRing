import { Resolver, Query, Mutation, Arg, Ctx, ID } from "type-graphql";
import { SensorBatch, SensorReading } from "../entities";
import { IngestBatchInput } from "./inputs";
import { MyContext } from "./context";
import { mapAppError } from "./errors";

@Resolver()
export class SyncResolver {
  @Mutation(() => SensorBatch, {
    description: "Ingest an idempotent batch of sensor readings from a sync client",
  })
  async ingestBatch(
    @Arg("input", () => IngestBatchInput) input: IngestBatchInput,
    @Ctx() { services }: MyContext
  ): Promise<SensorBatch> {
    try {
      const result = await services.sync.ingestBatch(input);
      result.batch.duplicate = result.duplicate;
      return result.batch;
    } catch (err) {
      mapAppError(err);
    }
  }

  @Query(() => [SensorReading], {
    description: "Retrieve readings for a study session",
  })
  async sessionReadings(
    @Arg("sessionId", () => ID) sessionId: string,
    @Ctx() { services }: MyContext
  ): Promise<SensorReading[]> {
    try {
      return await services.sync.getSessionReadings(sessionId);
    } catch (err) {
      mapAppError(err);
    }
  }

  @Query(() => String, {
    description: "Export session readings as CSV text",
  })
  async exportSessionCsv(
    @Arg("sessionId", () => ID) sessionId: string,
    @Ctx() { services }: MyContext
  ): Promise<string> {
    try {
      return await services.sync.exportSessionCsv(sessionId);
    } catch (err) {
      mapAppError(err);
    }
  }
}
