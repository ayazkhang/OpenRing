import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: string; output: string; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: Record<string, number | string | boolean | null>; output: Record<string, number | string | boolean | null>; }
};

export type CreateSessionInput = {
  /** Anonymized participant ID | Validation: IsNotEmpty */
  anonymizedParticipantId: Scalars['String']['input'];
  /** Assigned device ID | Validation: IsNotEmpty */
  deviceId: Scalars['ID']['input'];
  /** Enabled sensors for this session | Validation: ArrayMinSize(1) */
  enabledSensors: Array<SensorType>;
  /** Study ID | Validation: IsNotEmpty */
  studyId: Scalars['String']['input'];
  /** Study name | Validation: IsOptional */
  studyName?: InputMaybe<Scalars['String']['input']>;
};

/** Registered smart ring device */
export type Device = {
  __typename?: 'Device';
  createdAt: Scalars['DateTimeISO']['output'];
  firmwareVersion: Scalars['String']['output'];
  hardwareRevision: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  serialNumber: Scalars['String']['output'];
  status: DeviceStatus;
  supportedSensors: Array<SensorType>;
  updatedAt: Scalars['DateTimeISO']['output'];
};

/** Lifecycle status of a registered ring */
export type DeviceStatus =
  | 'active'
  | 'error'
  | 'registered';

export type IngestBatchInput = {
  /** Client batch/sync ID | Validation: IsNotEmpty */
  batchId: Scalars['ID']['input'];
  /** Device ID | Validation: IsNotEmpty */
  deviceId: Scalars['ID']['input'];
  /** Timestamped readings | Validation: ArrayMinSize(1) */
  readings: Array<ReadingInput>;
  /** Sensor type for this batch | Validation: IsEnum */
  sensorType: SensorType;
  /** Session ID | Validation: IsNotEmpty */
  sessionId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a study session for an anonymized participant */
  createSession: StudySession;
  /** Ingest an idempotent batch of sensor readings from a sync client */
  ingestBatch: SensorBatch;
  /** Register a smart ring device */
  registerDevice: Device;
};


export type MutationCreateSessionArgs = {
  input: CreateSessionInput;
};


export type MutationIngestBatchArgs = {
  input: IngestBatchInput;
};


export type MutationRegisterDeviceArgs = {
  input: RegisterDeviceInput;
};

export type Query = {
  __typename?: 'Query';
  /** Get a registered device by ID */
  device?: Maybe<Device>;
  /** List registered devices */
  devices: Array<Device>;
  /** Export session readings as CSV text */
  exportSessionCsv: Scalars['String']['output'];
  /** API health check */
  health: Scalars['String']['output'];
  /** Get a study session by ID */
  session?: Maybe<StudySession>;
  /** Retrieve readings for a study session */
  sessionReadings: Array<SensorReading>;
  /** List study sessions */
  sessions: Array<StudySession>;
};


export type QueryDeviceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExportSessionCsvArgs = {
  sessionId: Scalars['ID']['input'];
};


export type QuerySessionArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySessionReadingsArgs = {
  sessionId: Scalars['ID']['input'];
};

export type ReadingInput = {
  /** Optional quality flag | Validation: IsOptional */
  qualityFlag?: InputMaybe<Scalars['String']['input']>;
  /** UTC ISO timestamp | Validation: IsISO8601 */
  timestamp: Scalars['String']['input'];
  /** Sensor payload values | Validation: IsObject */
  values: Scalars['JSONObject']['input'];
};

export type RegisterDeviceInput = {
  /** Firmware version | Validation: IsNotEmpty */
  firmwareVersion: Scalars['String']['input'];
  /** Hardware revision | Validation: IsNotEmpty */
  hardwareRevision: Scalars['String']['input'];
  /** Device ID | Validation: IsNotEmpty */
  id: Scalars['ID']['input'];
  /** Serial number | Validation: IsNotEmpty */
  serialNumber: Scalars['String']['input'];
  /** Initial status | Validation: IsOptional | Validation: IsEnum */
  status?: InputMaybe<DeviceStatus>;
  /** Supported sensor modules | Validation: ArrayMinSize(1) */
  supportedSensors: Array<SensorType>;
};

/** Idempotent sync batch of sensor readings */
export type SensorBatch = {
  __typename?: 'SensorBatch';
  /** Client-provided sync/batch ID */
  batchId: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  deviceId: Scalars['String']['output'];
  /** True when batchId was already ingested */
  duplicate?: Maybe<Scalars['Boolean']['output']>;
  readingCount: Scalars['Int']['output'];
  readings?: Maybe<Array<SensorReading>>;
  sensorType: SensorType;
  sessionId: Scalars['String']['output'];
};

/** Single timestamped sensor sample */
export type SensorReading = {
  __typename?: 'SensorReading';
  batchId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  qualityFlag?: Maybe<Scalars['String']['output']>;
  sensorType: SensorType;
  sessionId: Scalars['String']['output'];
  timestamp: Scalars['DateTimeISO']['output'];
  values: Scalars['JSONObject']['output'];
};

/** Supported wearable sensor modules */
export type SensorType =
  | 'imu'
  | 'ppg'
  | 'temperature';

/** Study session linking participant, device, and sensors */
export type StudySession = {
  __typename?: 'StudySession';
  anonymizedParticipantId: Scalars['String']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  device: Device;
  deviceId: Scalars['String']['output'];
  enabledSensors: Array<SensorType>;
  id: Scalars['ID']['output'];
  studyId: Scalars['String']['output'];
  studyName?: Maybe<Scalars['String']['output']>;
};

export type GetDevicesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDevicesQuery = { __typename?: 'Query', devices: Array<{ __typename?: 'Device', id: string, serialNumber: string, firmwareVersion: string, hardwareRevision: string, supportedSensors: Array<SensorType>, status: DeviceStatus, createdAt: string }> };

export type GetSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSessionsQuery = { __typename?: 'Query', sessions: Array<{ __typename?: 'StudySession', id: string, studyId: string, studyName?: string | null, anonymizedParticipantId: string, deviceId: string, enabledSensors: Array<SensorType>, createdAt: string }> };

export type GetSessionReadingsQueryVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type GetSessionReadingsQuery = { __typename?: 'Query', sessionReadings: Array<{ __typename?: 'SensorReading', id: string, batchId: string, sensorType: SensorType, timestamp: string, values: Record<string, number | string | boolean | null>, qualityFlag?: string | null }> };

export type RegisterDeviceMutationVariables = Exact<{
  input: RegisterDeviceInput;
}>;


export type RegisterDeviceMutation = { __typename?: 'Mutation', registerDevice: { __typename?: 'Device', id: string, serialNumber: string, firmwareVersion: string, hardwareRevision: string, supportedSensors: Array<SensorType>, status: DeviceStatus } };

export type CreateSessionMutationVariables = Exact<{
  input: CreateSessionInput;
}>;


export type CreateSessionMutation = { __typename?: 'Mutation', createSession: { __typename?: 'StudySession', id: string, studyId: string, studyName?: string | null, anonymizedParticipantId: string, deviceId: string, enabledSensors: Array<SensorType> } };

export type IngestBatchMutationVariables = Exact<{
  input: IngestBatchInput;
}>;


export type IngestBatchMutation = { __typename?: 'Mutation', ingestBatch: { __typename?: 'SensorBatch', batchId: string, deviceId: string, sessionId: string, sensorType: SensorType, readingCount: number, duplicate?: boolean | null } };


export const GetDevicesDocument = gql`
    query GetDevices {
  devices {
    id
    serialNumber
    firmwareVersion
    hardwareRevision
    supportedSensors
    status
    createdAt
  }
}
    `;

/**
 * __useGetDevicesQuery__
 *
 * To run a query within a React component, call `useGetDevicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDevicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDevicesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDevicesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetDevicesQuery, GetDevicesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetDevicesQuery, GetDevicesQueryVariables>(GetDevicesDocument, options);
      }
export function useGetDevicesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetDevicesQuery, GetDevicesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetDevicesQuery, GetDevicesQueryVariables>(GetDevicesDocument, options);
        }
export function useGetDevicesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetDevicesQuery, GetDevicesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetDevicesQuery, GetDevicesQueryVariables>(GetDevicesDocument, options);
        }
export type GetDevicesQueryHookResult = ReturnType<typeof useGetDevicesQuery>;
export type GetDevicesLazyQueryHookResult = ReturnType<typeof useGetDevicesLazyQuery>;
export type GetDevicesSuspenseQueryHookResult = ReturnType<typeof useGetDevicesSuspenseQuery>;
export type GetDevicesQueryResult = Apollo.QueryResult<GetDevicesQuery, GetDevicesQueryVariables>;
export const GetSessionsDocument = gql`
    query GetSessions {
  sessions {
    id
    studyId
    studyName
    anonymizedParticipantId
    deviceId
    enabledSensors
    createdAt
  }
}
    `;

/**
 * __useGetSessionsQuery__
 *
 * To run a query within a React component, call `useGetSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSessionsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetSessionsQuery, GetSessionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSessionsQuery, GetSessionsQueryVariables>(GetSessionsDocument, options);
      }
export function useGetSessionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSessionsQuery, GetSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSessionsQuery, GetSessionsQueryVariables>(GetSessionsDocument, options);
        }
export function useGetSessionsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSessionsQuery, GetSessionsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetSessionsQuery, GetSessionsQueryVariables>(GetSessionsDocument, options);
        }
export type GetSessionsQueryHookResult = ReturnType<typeof useGetSessionsQuery>;
export type GetSessionsLazyQueryHookResult = ReturnType<typeof useGetSessionsLazyQuery>;
export type GetSessionsSuspenseQueryHookResult = ReturnType<typeof useGetSessionsSuspenseQuery>;
export type GetSessionsQueryResult = Apollo.QueryResult<GetSessionsQuery, GetSessionsQueryVariables>;
export const GetSessionReadingsDocument = gql`
    query GetSessionReadings($sessionId: ID!) {
  sessionReadings(sessionId: $sessionId) {
    id
    batchId
    sensorType
    timestamp
    values
    qualityFlag
  }
}
    `;

/**
 * __useGetSessionReadingsQuery__
 *
 * To run a query within a React component, call `useGetSessionReadingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSessionReadingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSessionReadingsQuery({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *   },
 * });
 */
export function useGetSessionReadingsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetSessionReadingsQuery, GetSessionReadingsQueryVariables> & ({ variables: GetSessionReadingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSessionReadingsQuery, GetSessionReadingsQueryVariables>(GetSessionReadingsDocument, options);
      }
export function useGetSessionReadingsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSessionReadingsQuery, GetSessionReadingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSessionReadingsQuery, GetSessionReadingsQueryVariables>(GetSessionReadingsDocument, options);
        }
export function useGetSessionReadingsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSessionReadingsQuery, GetSessionReadingsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetSessionReadingsQuery, GetSessionReadingsQueryVariables>(GetSessionReadingsDocument, options);
        }
export type GetSessionReadingsQueryHookResult = ReturnType<typeof useGetSessionReadingsQuery>;
export type GetSessionReadingsLazyQueryHookResult = ReturnType<typeof useGetSessionReadingsLazyQuery>;
export type GetSessionReadingsSuspenseQueryHookResult = ReturnType<typeof useGetSessionReadingsSuspenseQuery>;
export type GetSessionReadingsQueryResult = Apollo.QueryResult<GetSessionReadingsQuery, GetSessionReadingsQueryVariables>;
export const RegisterDeviceDocument = gql`
    mutation RegisterDevice($input: RegisterDeviceInput!) {
  registerDevice(input: $input) {
    id
    serialNumber
    firmwareVersion
    hardwareRevision
    supportedSensors
    status
  }
}
    `;
export type RegisterDeviceMutationFn = Apollo.MutationFunction<RegisterDeviceMutation, RegisterDeviceMutationVariables>;

/**
 * __useRegisterDeviceMutation__
 *
 * To run a mutation, you first call `useRegisterDeviceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterDeviceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerDeviceMutation, { data, loading, error }] = useRegisterDeviceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterDeviceMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RegisterDeviceMutation, RegisterDeviceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RegisterDeviceMutation, RegisterDeviceMutationVariables>(RegisterDeviceDocument, options);
      }
export type RegisterDeviceMutationHookResult = ReturnType<typeof useRegisterDeviceMutation>;
export type RegisterDeviceMutationResult = Apollo.MutationResult<RegisterDeviceMutation>;
export type RegisterDeviceMutationOptions = Apollo.BaseMutationOptions<RegisterDeviceMutation, RegisterDeviceMutationVariables>;
export const CreateSessionDocument = gql`
    mutation CreateSession($input: CreateSessionInput!) {
  createSession(input: $input) {
    id
    studyId
    studyName
    anonymizedParticipantId
    deviceId
    enabledSensors
  }
}
    `;
export type CreateSessionMutationFn = Apollo.MutationFunction<CreateSessionMutation, CreateSessionMutationVariables>;

/**
 * __useCreateSessionMutation__
 *
 * To run a mutation, you first call `useCreateSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSessionMutation, { data, loading, error }] = useCreateSessionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSessionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateSessionMutation, CreateSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateSessionMutation, CreateSessionMutationVariables>(CreateSessionDocument, options);
      }
export type CreateSessionMutationHookResult = ReturnType<typeof useCreateSessionMutation>;
export type CreateSessionMutationResult = Apollo.MutationResult<CreateSessionMutation>;
export type CreateSessionMutationOptions = Apollo.BaseMutationOptions<CreateSessionMutation, CreateSessionMutationVariables>;
export const IngestBatchDocument = gql`
    mutation IngestBatch($input: IngestBatchInput!) {
  ingestBatch(input: $input) {
    batchId
    deviceId
    sessionId
    sensorType
    readingCount
    duplicate
  }
}
    `;
export type IngestBatchMutationFn = Apollo.MutationFunction<IngestBatchMutation, IngestBatchMutationVariables>;

/**
 * __useIngestBatchMutation__
 *
 * To run a mutation, you first call `useIngestBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIngestBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [ingestBatchMutation, { data, loading, error }] = useIngestBatchMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useIngestBatchMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<IngestBatchMutation, IngestBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<IngestBatchMutation, IngestBatchMutationVariables>(IngestBatchDocument, options);
      }
export type IngestBatchMutationHookResult = ReturnType<typeof useIngestBatchMutation>;
export type IngestBatchMutationResult = Apollo.MutationResult<IngestBatchMutation>;
export type IngestBatchMutationOptions = Apollo.BaseMutationOptions<IngestBatchMutation, IngestBatchMutationVariables>;