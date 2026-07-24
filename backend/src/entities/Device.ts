import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID, GraphQLISODateTime } from "type-graphql";
import { StudySession } from "./StudySession";
import { DeviceStatus, SensorType } from "../types";

@ObjectType({ description: "Registered smart ring device" })
@Entity("devices")
export class Device {
  @Field(() => ID)
  @PrimaryColumn({ type: "varchar", length: 128 })
  id!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 64 })
  serialNumber!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 64 })
  firmwareVersion!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 64 })
  hardwareRevision!: string;

  @Field(() => [SensorType])
  @Column({ type: "simple-array" })
  supportedSensors!: SensorType[];

  @Field(() => DeviceStatus)
  @Column({ type: "varchar", length: 32, default: DeviceStatus.registered })
  status!: DeviceStatus;

  @OneToMany(() => StudySession, (session) => session.device)
  sessions!: StudySession[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt!: Date;
}
