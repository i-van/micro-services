import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

let server: FastifyInstance;

export const start = async () => {
  try {
    server = Fastify({ logger: true });

    server.get('/', async (request, reply) => {
      return { pong: 'it worked!' };
    });

    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    throw err;
  }
};

export const stop = async () => {
  await server?.close();
};
