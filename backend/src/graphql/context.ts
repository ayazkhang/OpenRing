import { DataSource } from "typeorm";
import {
  DeviceService,
  SessionService,
  SyncService,
} from "../services";

export type Services = {
  devices: DeviceService;
  sessions: SessionService;
  sync: SyncService;
};

export interface MyContext {
  services: Services;
  dataSource: DataSource;
}

export function createServices(ds: DataSource): Services {
  const devices = new DeviceService(ds);
  const sessions = new SessionService(ds, devices);
  const sync = new SyncService(ds, devices, sessions);
  return { devices, sessions, sync };
}
