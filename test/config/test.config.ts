export const testConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5431,
    username: 'root',
    password: '123456',
    database: 'tasks_e2e',
    synchronize: true,
  },
  app: {
    messagePrefix: '',
  },
  auth: {
    jwt: {
      secret: 'dummy_secret',
      expiresIn: '1m',
    },
  },
};
