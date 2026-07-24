# Part 1 — System Architecture

MVP for a wearable research platform. Keeping it simple: one API, one database, no microservices.

## Diagram

```
Ring --BLE--> Mobile sync app --HTTPS--> Backend API --> Postgres
Researcher console -> Backend API
```

The ring and BLE stay on the mobile/desktop side. Backend only gets batches over HTTPS.

## Main pieces

- Mobile sync client: talks to the ring, queues data offline, uploads batches
- Backend API: register devices/sessions, ingest batches, export readings
- Postgres: store devices, sessions, batches, readings
- Researcher UI: thin console on top of the same API (optional for this assessment)

## Researcher flow

1. Register a device (serial, firmware, sensors, status)
2. Create a session (study id/name, anonymized participant, device, enabled sensors)
3. Mobile sync uploads batches while the study runs
4. Researcher pulls readings or downloads CSV

I did not model a full Study/Participant tables for MVP study fields live on the session. Good enough for the coding exercise.

## Data model

- Device: id, serial, firmware, hardware revision, supported sensors, status
- StudySession: study id/name, anonymized participant id, device id, enabled sensors
- SensorBatch: batch id (from client), device, session, sensor type
- SensorReading: timestamp, values (json), optional quality flag

batch id is unique so retries don't create duplicates.

## Backend choices

- Node + Express + GraphQL (type-graphql) + TypeORM + Postgres
- Why: typed API, easy validation, Postgres handles relational data + JSON payloads
- Validate inputs, check device/session exist, check sensor is enabled for the session
- Ingest runs in a transaction
- CSV export over GraphQL and a simple REST route

## Sync boundary

Backend does not do BLE. Contract is roughly:

```
batchId, deviceId, sessionId, sensorType, readings[{ timestamp, values, qualityFlag? }]
```

Client should retry with the same batchId. Timestamps in UTC.

## Security / privacy (notes only — not built)

- No auth in this MVP (timeboxed)
- Later: login for researchers, tokens for sync clients
- Only anonymized participant ids in the DB
- Audit exports, think about retention / GDPR later

## Scaling

- <100 devices: current setup is fine
- Bigger: real migrations, indexes, paginate dashboard, async export to S3, maybe partition readings
