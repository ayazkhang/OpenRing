import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ObjectType, Field, ID, GraphQLISODateTime } from "type-graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import { SensorBatch } from "./SensorBatch";
import { SensorType } from "../types";

@ObjectType({ description: "Single timestamped sensor sample" })
@Entity("sensor_readings")
export class SensorReading {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field(() => String)
  @Index()
  @Column({ type: "uuid" })
  sessionId!: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 128 })
  batchId!: string;

  @ManyToOne(() => SensorBatch, (batch) => batch.readings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "batchId" })
  batch!: SensorBatch;

  @Field(() => SensorType)
  @Column({ type: "varchar", length: 32 })
  sensorType!: SensorType;

  @Field(() => GraphQLISODateTime)
  @Index()
  @Column({ type: "timestamptz" })
  timestamp!: Date;

  @Field(() => GraphQLJSONObject)
  @Column({ type: "jsonb" })
  values!: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 64, nullable: true })
  qualityFlag!: string | null;
}
