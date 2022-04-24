import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { graphqlUploadExpress } from 'graphql-upload';
import express from 'express';
import http from 'http';
import { success, error } from 'consola';
import { PORT, DB } from './config';
import { typeDefs, resolvers } from './graphql';
import * as Models from './models';
import { AuthMiddleWare } from './middlewares';
import { join } from 'path';

import mongoose from 'mongoose';

(async function startApolloServer(typeDefs, resolvers) {
  // CONNECT TO MONGO DB
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    success({
      badge: true,
      message: `Successfully connected to the database`,
    });

    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: { ...Models },
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // always start the server before applying any middlewares
    await server.start();

    app.use(express.static(join(__dirname, 'uploads')));
    app.use(AuthMiddleWare)
    app.use(graphqlUploadExpress());
    server.applyMiddleware({ app });
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    success({
      badge: true,
      message: `🚀 Server ready at http://localhost:4000${server.graphqlPath}`,
    });
  } catch (err) {
    error({ badge: true, message: err.message });
    process.exit(1);
  }
})(typeDefs, resolvers);
