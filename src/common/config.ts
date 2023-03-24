const {
  APP_HOST = '0.0.0.0',
  APP_PORT = 3000,
  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = 6379,
} = process.env;

export const config = {
  app: {
    host: APP_HOST,
    port: Number(APP_PORT),
  },
  redis: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
};
