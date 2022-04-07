import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';
import path from 'path';

const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, 'resolvers'))
);
const typeDefs = loadSchemaSync('./**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

export { resolvers, typeDefs };
