import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { ObjectType, Field, ID, Int, GraphQLISODateTime } from "type-graphql";
import { StudySession } from "./StudySession";
import { SensorReading } from "./SensorReading";
import { SensorType } from "../types";

@ObjectType({ description: "Idempotent sync batch of sensor readings" })
@Entity("sensor_batches")
export class SensorBatch {
  @Field(() => ID, { description: "Client-provided sync/batch ID" })
  @PrimaryColumn({ type: "varchar", length: 128 })
  batchId!: string;

  @Field(() => String)
  @Index()
  @Column({ type: "varchar", length: 128 })
  deviceId!: string;

  @Field(() => String)
  @Index()
  @Column({ type: "uuid" })
  sessionId!: string;

  @ManyToOne(() => StudySession, (session) => session.batches)
  @JoinColumn({ name: "sessionId" })
  session!: StudySession;

  @Field(() => SensorType)
  @Column({ type: "varchar", length: 32 })
  sensorType!: SensorType;

  @Field(() => Int)
  @Column({ type: "int" })
  readingCount!: number;

  @Field(() => [SensorReading], { nullable: true })
  @OneToMany(() => SensorReading, (reading) => reading.batch, {
    cascade: true,
  })
  readings!: SensorReading[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt!: Date;

  /** Set only on ingest responses; not persisted. */
  @Field(() => Boolean, {
    nullable: true,
    description: "True when batchId was already ingested",
  })
  duplicate?: boolean;
}
