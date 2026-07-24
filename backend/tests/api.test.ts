import "reflect-metadata";
import request from "supertest";
import { DataSource } from "typeorm";
import { Express } from "express";
import { buildDataSourceOptions } from "../src/data-source";
import { createApp } from "../src/app";

async function gql(app: Express, query: string, variables?: Record<string, unknown>) {
  const res = await request(app)
    .post("/graphql")
    .send({ query, variables });
  return res;
}

describe("OpenRing sync API", () => {
  let ds: DataSource;
  let app: Express;

  beforeAll(async () => {
    ds = new DataSource(
      buildDataSourceOptions({
        database: process.env.DATABASE_NAME || "openring_test",
        dropSchema: true,
        synchronize: true,
      })
    );
    await ds.initialize();
    const created = await createApp(ds);
    app = created.app;
  });

  afterAll(async () => {
    if (ds?.isInitialized) {
      await ds.destroy();
    }
  });

  beforeEach(async () => {
    await ds.synchronize(true);
  });

  const registerDeviceMutation = `
    mutation RegisterDevice($input: RegisterDeviceInput!) {
      registerDevice(input: $input) {
        id
        serialNumber
        firmwareVersion
        hardwareRevision
        supportedSensors
        status
      }
    }
  `;

  const createSessionMutation = `
    mutation CreateSession($input: CreateSessionInput!) {
      createSession(input: $input) {
        id
        studyId
        studyName
        anonymizedParticipantId
        deviceId
        enabledSensors
      }
    }
  `;

  const ingestBatchMutation = `
    mutation IngestBatch($input: IngestBatchInput!) {
      ingestBatch(input: $input) {
        batchId
        deviceId
        sessionId
        sensorType
        readingCount
        duplicate
      }
    }
  `;

  async function seedDeviceAndSession() {
    const deviceRes = await gql(app, registerDeviceMutation, {
      input: {
        id: "ring-001",
        serialNumber: "SN-001",
        firmwareVersion: "1.0.0",
        hardwareRevision: "A1",
        supportedSensors: ["imu", "ppg", "temperature"],
        status: "active",
      },
    });
    expect(deviceRes.body.errors).toBeUndefined();

    const sessionRes = await gql(app, createSessionMutation, {
      input: {
        studyId: "study-hrv",
        studyName: "HRV Pilot",
        anonymizedParticipantId: "p-anon-42",
        deviceId: "ring-001",
        enabledSensors: ["imu", "ppg"],
      },
    });
    expect(sessionRes.body.errors).toBeUndefined();
    return sessionRes.body.data.createSession.id as string;
  }

  test("device registration", async () => {
    const res = await gql(app, registerDeviceMutation, {
      input: {
        id: "ring-100",
        serialNumber: "SN-100",
        firmwareVersion: "1.2.0",
        hardwareRevision: "B2",
        supportedSensors: ["imu", "temperature"],
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.registerDevice).toMatchObject({
      id: "ring-100",
      serialNumber: "SN-100",
      status: "registered",
      supportedSensors: ["imu", "temperature"],
    });
  });

  test("session creation", async () => {
    const sessionId = await seedDeviceAndSession();
    expect(sessionId).toBeTruthy();

    const res = await gql(
      app,
      `query($id: ID!) { session(id: $id) { id studyId deviceId enabledSensors } }`,
      { id: sessionId }
    );
    expect(res.body.data.session.enabledSensors).toEqual(["imu", "ppg"]);
  });

  test("valid batch ingestion and session readings retrieval", async () => {
    const sessionId = await seedDeviceAndSession();

    const ingest = await gql(app, ingestBatchMutation, {
      input: {
        batchId: "batch-1",
        deviceId: "ring-001",
        sessionId,
        sensorType: "imu",
        readings: [
          {
            timestamp: "2026-01-01T12:00:00Z",
            values: { x: 0.01, y: 0.02, z: 0.98 },
            qualityFlag: "good",
          },
          {
            timestamp: "2026-01-01T12:00:01Z",
            values: { x: 0.02, y: 0.01, z: 0.97 },
          },
        ],
      },
    });

    expect(ingest.body.errors).toBeUndefined();
    expect(ingest.body.data.ingestBatch).toMatchObject({
      batchId: "batch-1",
      readingCount: 2,
      duplicate: false,
      sensorType: "imu",
    });

    const readings = await gql(
      app,
      `query($sessionId: ID!) {
        sessionReadings(sessionId: $sessionId) {
          batchId
          sensorType
          timestamp
          values
          qualityFlag
        }
      }`,
      { sessionId }
    );

    expect(readings.body.errors).toBeUndefined();
    expect(readings.body.data.sessionReadings).toHaveLength(2);
    expect(readings.body.data.sessionReadings[0].values).toEqual({
      x: 0.01,
      y: 0.02,
      z: 0.98,
    });
  });

  test("duplicate batch handling is idempotent", async () => {
    const sessionId = await seedDeviceAndSession();
    const payload = {
      input: {
        batchId: "batch-dup",
        deviceId: "ring-001",
        sessionId,
        sensorType: "ppg",
        readings: [
          {
            timestamp: "2026-01-01T12:00:00Z",
            values: { hr: 72, spo2: 98 },
          },
        ],
      },
    };

    const first = await gql(app, ingestBatchMutation, payload);
    const second = await gql(app, ingestBatchMutation, payload);

    expect(first.body.data.ingestBatch.duplicate).toBe(false);
    expect(second.body.data.ingestBatch.duplicate).toBe(true);

    const readings = await gql(
      app,
      `query($sessionId: ID!) { sessionReadings(sessionId: $sessionId) { id } }`,
      { sessionId }
    );
    expect(readings.body.data.sessionReadings).toHaveLength(1);
  });

  test("unknown device rejection", async () => {
    const sessionId = await seedDeviceAndSession();
    const res = await gql(app, ingestBatchMutation, {
      input: {
        batchId: "batch-x",
        deviceId: "missing-device",
        sessionId,
        sensorType: "imu",
        readings: [
          {
            timestamp: "2026-01-01T12:00:00Z",
            values: { x: 0, y: 0, z: 1 },
          },
        ],
      },
    });

    expect(res.body.errors?.[0].message).toMatch(/Unknown device/i);
    expect(res.body.errors?.[0].extensions.code).toBe("UNKNOWN_DEVICE");
  });

  test("unknown session rejection", async () => {
    await seedDeviceAndSession();
    const res = await gql(app, ingestBatchMutation, {
      input: {
        batchId: "batch-y",
        deviceId: "ring-001",
        sessionId: "00000000-0000-0000-0000-000000000099",
        sensorType: "imu",
        readings: [
          {
            timestamp: "2026-01-01T12:00:00Z",
            values: { x: 0, y: 0, z: 1 },
          },
        ],
      },
    });

    expect(res.body.errors?.[0].message).toMatch(/Unknown session/i);
    expect(res.body.errors?.[0].extensions.code).toBe("UNKNOWN_SESSION");
  });

  test("disabled sensor rejection", async () => {
    const sessionId = await seedDeviceAndSession();
    const res = await gql(app, ingestBatchMutation, {
      input: {
        batchId: "batch-temp",
        deviceId: "ring-001",
        sessionId,
        sensorType: "temperature",
        readings: [
          {
            timestamp: "2026-01-01T12:00:00Z",
            values: { celsius: 36.5 },
          },
        ],
      },
    });

    expect(res.body.errors?.[0].extensions.code).toBe("SENSOR_NOT_ENABLED");
  });

  test("unsupported sensor on device is rejected at session creation", async () => {
    const deviceRes = await gql(app, registerDeviceMutation, {
      input: {
        id: "ring-imu-only",
        serialNumber: "SN-IMU",
        firmwareVersion: "1.0.0",
        hardwareRevision: "A1",
        supportedSensors: ["imu"],
      },
    });
    expect(deviceRes.body.errors).toBeUndefined();

    const sessionRes = await gql(app, createSessionMutation, {
      input: {
        studyId: "study-ppg",
        anonymizedParticipantId: "p-anon-99",
        deviceId: "ring-imu-only",
        enabledSensors: ["ppg"],
      },
    });

    expect(sessionRes.body.errors?.[0].extensions.code).toBe(
      "SENSOR_NOT_SUPPORTED"
    );
  });

  test("malformed payload validation", async () => {
    const sessionId = await seedDeviceAndSession();
    const res = await gql(app, ingestBatchMutation, {
      input: {
        batchId: "batch-bad",
        deviceId: "ring-001",
        sessionId,
        sensorType: "imu",
        readings: [
          {
            timestamp: "not-a-date",
            values: { x: 0, y: 0, z: 1 },
          },
        ],
      },
    });

    // class-validator (type-graphql) or service-layer validation both reject bad timestamps
    expect(res.body.errors?.[0]).toBeDefined();
    const code = res.body.errors?.[0].extensions?.code;
    expect(["VALIDATION_ERROR", "BAD_USER_INPUT", "GRAPHQL_VALIDATION_FAILED"]).toContain(
      code
    );
  });

  test("CSV export endpoint", async () => {
    const sessionId = await seedDeviceAndSession();
    await gql(app, ingestBatchMutation, {
      input: {
        batchId: "batch-csv",
        deviceId: "ring-001",
        sessionId,
        sensorType: "imu",
        readings: [
          {
            timestamp: "2026-01-01T12:00:00Z",
            values: { x: 0.1, y: 0.2, z: 0.9 },
          },
        ],
      },
    });

    const res = await request(app).get(`/sessions/${sessionId}/export`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.text).toContain("sensor_type");
    expect(res.text).toContain("imu");
  });
});
