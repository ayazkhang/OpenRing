import { DataSource } from "typeorm";
import { StudySession } from "../entities";
import { SensorType } from "../types";
import { CreateSessionInput } from "../graphql/inputs";
import { AppError, DeviceService } from "./DeviceService";

export class SessionService {
  constructor(
    private readonly ds: DataSource,
    private readonly devices: DeviceService
  ) {}

  private repo() {
    return this.ds.getRepository(StudySession);
  }

  async create(input: CreateSessionInput): Promise<StudySession> {
    const device = await this.devices.getById(input.deviceId);

    for (const sensor of input.enabledSensors) {
      if (!device.supportedSensors.includes(sensor)) {
        throw new AppError(
          `Device ${device.id} does not support sensor: ${sensor}`,
          "SENSOR_NOT_SUPPORTED"
        );
      }
    }

    const session = this.repo().create({
      studyId: input.studyId.trim(),
      studyName: input.studyName?.trim() || null,
      anonymizedParticipantId: input.anonymizedParticipantId.trim(),
      deviceId: device.id,
      enabledSensors: input.enabledSensors as SensorType[],
    });

    return this.repo().save(session);
  }

  async getById(id: string): Promise<StudySession> {
    const session = await this.repo().findOne({ where: { id } });
    if (!session) {
      throw new AppError(`Unknown session: ${id}`, "UNKNOWN_SESSION", 404);
    }
    return session;
  }

  async list(): Promise<StudySession[]> {
    return this.repo().find({ order: { createdAt: "DESC" } });
  }
}
