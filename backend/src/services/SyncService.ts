import { DataSource } from "typeorm";
import { SensorBatch, SensorReading } from "../entities";
import { SENSOR_VALUE_KEYS, SensorType } from "../types";
import { IngestBatchInput } from "../graphql/inputs";
import { AppError, DeviceService } from "./DeviceService";
import { SessionService } from "./SessionService";

export interface IngestBatchResult {
  batch: SensorBatch;
  duplicate: boolean;
}

export class SyncService {
  constructor(
    private readonly ds: DataSource,
    private readonly devices: DeviceService,
    private readonly sessions: SessionService
  ) {}

  async ingestBatch(input: IngestBatchInput): Promise<IngestBatchResult> {
    const batchRepo = this.ds.getRepository(SensorBatch);
    const existing = await batchRepo.findOne({
      where: { batchId: input.batchId },
      relations: ["readings"],
    });

    if (existing) {
      return { batch: existing, duplicate: true };
    }

    const device = await this.devices.getById(input.deviceId);
    const session = await this.sessions.getById(input.sessionId);

    if (session.deviceId !== device.id) {
      throw new AppError(
        `Device ${device.id} is not assigned to session ${session.id}`,
        "DEVICE_SESSION_MISMATCH"
      );
    }

    const sensorType = input.sensorType;

    if (!session.enabledSensors.includes(sensorType)) {
      throw new AppError(
        `Sensor ${sensorType} is not enabled for session ${session.id}`,
        "SENSOR_NOT_ENABLED"
      );
    }

    if (!device.supportedSensors.includes(sensorType)) {
      throw new AppError(
        `Device ${device.id} does not support sensor: ${sensorType}`,
        "SENSOR_NOT_SUPPORTED"
      );
    }

    const requiredKeys = SENSOR_VALUE_KEYS[sensorType];
    const readingEntities: Partial<SensorReading>[] = [];

    for (let i = 0; i < input.readings.length; i++) {
      const reading = input.readings[i];
      const ts = Date.parse(reading.timestamp);
      if (Number.isNaN(ts)) {
        throw new AppError(
          `Invalid timestamp at readings[${i}]`,
          "VALIDATION_ERROR"
        );
      }
      if (!reading.values || typeof reading.values !== "object") {
        throw new AppError(
          `Malformed values at readings[${i}]`,
          "VALIDATION_ERROR"
        );
      }

      for (const key of requiredKeys) {
        const value = reading.values[key];
        if (typeof value !== "number" || Number.isNaN(value)) {
          throw new AppError(
            `Missing or invalid value "${key}" at readings[${i}] for ${sensorType}`,
            "VALIDATION_ERROR"
          );
        }
      }

      readingEntities.push({
        sessionId: session.id,
        sensorType,
        timestamp: new Date(ts),
        values: reading.values,
        qualityFlag: reading.qualityFlag ?? null,
      });
    }

    const saved = await this.ds.transaction(async (manager) => {
      const batch = manager.create(SensorBatch, {
        batchId: input.batchId,
        deviceId: device.id,
        sessionId: session.id,
        sensorType,
        readingCount: readingEntities.length,
      });
      await manager.save(batch);

      const readings = readingEntities.map((r) =>
        manager.create(SensorReading, { ...r, batchId: batch.batchId })
      );
      await manager.save(readings);
      batch.readings = readings as SensorReading[];
      return batch;
    });

    return { batch: saved, duplicate: false };
  }

  async getSessionReadings(sessionId: string): Promise<SensorReading[]> {
    await this.sessions.getById(sessionId);
    return this.ds.getRepository(SensorReading).find({
      where: { sessionId },
      order: { timestamp: "ASC" },
    });
  }

  async exportSessionCsv(sessionId: string): Promise<string> {
    const readings = await this.getSessionReadings(sessionId);
    const header = [
      "id",
      "session_id",
      "batch_id",
      "sensor_type",
      "timestamp",
      "values_json",
      "quality_flag",
    ];
    const lines = readings.map((r) =>
      [
        r.id,
        r.sessionId,
        r.batchId,
        r.sensorType,
        r.timestamp.toISOString(),
        JSON.stringify(r.values).replace(/"/g, '""'),
        r.qualityFlag ?? "",
      ]
        .map((cell) => `"${cell}"`)
        .join(",")
    );
    return [header.join(","), ...lines].join("\n");
  }
}
