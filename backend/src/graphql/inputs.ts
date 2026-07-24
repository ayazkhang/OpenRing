import { InputType, Field, ID } from "type-graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ArrayMinSize,
  IsISO8601,
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { GraphQLJSONObject } from "graphql-scalars";
import { DeviceStatus, SensorType } from "../types";

@InputType()
export class RegisterDeviceInput {
  @Field(() => ID, { description: "Device ID | Validation: IsNotEmpty" })
  @IsNotEmpty()
  id!: string;

  @Field(() => String, { description: "Serial number | Validation: IsNotEmpty" })
  @IsNotEmpty()
  serialNumber!: string;

  @Field(() => String, {
    description: "Firmware version | Validation: IsNotEmpty",
  })
  @IsNotEmpty()
  firmwareVersion!: string;

  @Field(() => String, {
    description: "Hardware revision | Validation: IsNotEmpty",
  })
  @IsNotEmpty()
  hardwareRevision!: string;

  @Field(() => [SensorType], {
    description: "Supported sensor modules | Validation: ArrayMinSize(1)",
  })
  @ArrayMinSize(1)
  @IsEnum(SensorType, { each: true })
  supportedSensors!: SensorType[];

  @Field(() => DeviceStatus, {
    nullable: true,
    description: "Initial status | Validation: IsOptional | Validation: IsEnum",
  })
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;
}

@InputType()
export class CreateSessionInput {
  @Field(() => String, { description: "Study ID | Validation: IsNotEmpty" })
  @IsNotEmpty()
  studyId!: string;

  @Field(() => String, {
    nullable: true,
    description: "Study name | Validation: IsOptional",
  })
  @IsOptional()
  studyName?: string;

  @Field(() => String, {
    description: "Anonymized participant ID | Validation: IsNotEmpty",
  })
  @IsNotEmpty()
  anonymizedParticipantId!: string;

  @Field(() => ID, { description: "Assigned device ID | Validation: IsNotEmpty" })
  @IsNotEmpty()
  deviceId!: string;

  @Field(() => [SensorType], {
    description: "Enabled sensors for this session | Validation: ArrayMinSize(1)",
  })
  @ArrayMinSize(1)
  @IsEnum(SensorType, { each: true })
  enabledSensors!: SensorType[];
}

@InputType()
export class ReadingInput {
  @Field(() => String, {
    description: "UTC ISO timestamp | Validation: IsISO8601",
  })
  @IsISO8601()
  timestamp!: string;

  @Field(() => GraphQLJSONObject, {
    description: "Sensor payload values | Validation: IsObject",
  })
  @IsObject()
  values!: Record<string, number>;

  @Field(() => String, {
    nullable: true,
    description: "Optional quality flag | Validation: IsOptional",
  })
  @IsOptional()
  qualityFlag?: string;
}

@InputType()
export class IngestBatchInput {
  @Field(() => ID, {
    description: "Client batch/sync ID | Validation: IsNotEmpty",
  })
  @IsNotEmpty()
  batchId!: string;

  @Field(() => ID, { description: "Device ID | Validation: IsNotEmpty" })
  @IsNotEmpty()
  deviceId!: string;

  @Field(() => ID, { description: "Session ID | Validation: IsNotEmpty" })
  @IsNotEmpty()
  sessionId!: string;

  @Field(() => SensorType, {
    description: "Sensor type for this batch | Validation: IsEnum",
  })
  @IsEnum(SensorType)
  sensorType!: SensorType;

  @Field(() => [ReadingInput], {
    description: "Timestamped readings | Validation: ArrayMinSize(1)",
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReadingInput)
  readings!: ReadingInput[];
}
