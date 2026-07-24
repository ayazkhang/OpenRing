import { DataSource } from "typeorm";
import { Device } from "../entities";
import { DeviceStatus, SensorType } from "../types";
import { RegisterDeviceInput } from "../graphql/inputs";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class DeviceService {
  constructor(private readonly ds: DataSource) {}

  private repo() {
    return this.ds.getRepository(Device);
  }

  async register(input: RegisterDeviceInput): Promise<Device> {
    const existing = await this.repo().findOne({ where: { id: input.id } });
    if (existing) {
      throw new AppError(
        `Device already registered: ${input.id}`,
        "DEVICE_EXISTS",
        409
      );
    }

    const device = this.repo().create({
      id: input.id.trim(),
      serialNumber: input.serialNumber.trim(),
      firmwareVersion: input.firmwareVersion.trim(),
      hardwareRevision: input.hardwareRevision.trim(),
      supportedSensors: input.supportedSensors,
      status: input.status || DeviceStatus.registered,
    });

    return this.repo().save(device);
  }

  async getById(id: string): Promise<Device> {
    const device = await this.repo().findOne({ where: { id } });
    if (!device) {
      throw new AppError(`Unknown device: ${id}`, "UNKNOWN_DEVICE", 404);
    }
    return device;
  }

  async list(): Promise<Device[]> {
    return this.repo().find({ order: { createdAt: "DESC" } });
  }
}
