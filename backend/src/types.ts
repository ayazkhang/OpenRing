import { registerEnumType } from "type-graphql";

export enum SensorType {
  imu = "imu",
  ppg = "ppg",
  temperature = "temperature",
}

export enum DeviceStatus {
  registered = "registered",
  active = "active",
  error = "error",
}

registerEnumType(SensorType, {
  name: "SensorType",
  description: "Supported wearable sensor modules",
});

registerEnumType(DeviceStatus, {
  name: "DeviceStatus",
  description: "Lifecycle status of a registered ring",
});

export const SENSOR_VALUE_KEYS: Record<SensorType, string[]> = {
  [SensorType.imu]: ["x", "y", "z"],
  [SensorType.ppg]: ["hr", "spo2"],
  [SensorType.temperature]: ["celsius"],
};

export function isSensorType(value: string): value is SensorType {
  return Object.values(SensorType).includes(value as SensorType);
}
