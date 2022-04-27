import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { ApolloError } from 'apollo-server-express';
export default function authenticationDirective(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async function (source, args, context, info) {
          let { isAuth, user } = context;

          if (isAuth) {
            const result = await resolve(source, args, context, info);
            return result;
          } else {
            throw new ApolloError(
              'You must be the authenticated user to get this information'
            );
          }
        };
        return fieldConfig;
      }
    },
  });
}
