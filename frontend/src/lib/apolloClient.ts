import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const uri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";

export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri, credentials: "include" }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
      query: { fetchPolicy: "network-only" },
    },
  });
}
