import { GraphQLUpload } from 'graphql-upload';
import { finished } from 'stream/promises';
import { parse, join } from 'path';
import { createWriteStream } from 'fs';
import { BASE_URL } from '../../config';
import { ApolloError } from 'apollo-server-express';
export default {
  Upload: GraphQLUpload,
  Query: {
    info: () => 'I am an image resolver method',
  },
  Mutation: {
    uploadFile: async (_, { file }, { Post }) => {
      try {
        const { createReadStream, filename } = await file;

        const stream = createReadStream();

        let { name, ext } = parse(filename);
        name = name.replace(/([^a-z0-9 ]+)/gi, '-').replace(' ', '_');
        let serverFile = join(
          __dirname,
          `../../uploads/${name}-${Date.now()}${ext}`
        );
        serverFile = serverFile.replace(' ', '_');
        let writeStream = createWriteStream(serverFile);

        stream.pipe(writeStream);

        await finished(writeStream);

        serverFile = `${BASE_URL}${serverFile.split('uploads')[1]}`.replace(
          `\\`,
          `/`
        );

        return serverFile;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
  },
};
