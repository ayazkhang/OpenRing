import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./graphql/schema.graphql",
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "./src/graphql/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        apolloReactHooksImportFrom: "@apollo/client",
        scalars: {
          DateTimeISO: "string",
          JSONObject: "Record<string, number | string | boolean | null>",
        },
        enumsAsTypes: true,
        skipTypename: false,
      },
    },
  },
};

export default config;
