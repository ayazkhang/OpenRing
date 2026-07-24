import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { ObjectType, Field, ID, GraphQLISODateTime } from "type-graphql";
import { Device } from "./Device";
import { SensorBatch } from "./SensorBatch";
import { SensorType } from "../types";

@ObjectType({ description: "Study session linking participant, device, and sensors" })
@Entity("study_sessions")
export class StudySession {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field(() => String)
  @Index()
  @Column({ type: "varchar", length: 128 })
  studyId!: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 256, nullable: true })
  studyName!: string | null;

  @Field(() => String)
  @Index()
  @Column({ type: "varchar", length: 128 })
  anonymizedParticipantId!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 128 })
  deviceId!: string;

  @Field(() => Device)
  @ManyToOne(() => Device, (device) => device.sessions, { eager: true })
  @JoinColumn({ name: "deviceId" })
  device!: Device;

  @Field(() => [SensorType])
  @Column({ type: "simple-array" })
  enabledSensors!: SensorType[];

  @OneToMany(() => SensorBatch, (batch) => batch.session)
  batches!: SensorBatch[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt!: Date;
}
