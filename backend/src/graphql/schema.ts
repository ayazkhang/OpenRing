import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { DeviceResolver } from "./DeviceResolver";
import { SessionResolver } from "./SessionResolver";
import { SyncResolver } from "./SyncResolver";
import { MyContext } from "./context";

export async function buildAppSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [DeviceResolver, SessionResolver, SyncResolver],
    validate: {
      forbidUnknownValues: false,
    },
  });
}

export type { MyContext };
