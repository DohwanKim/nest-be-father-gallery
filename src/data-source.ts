import 'reflect-metadata';
import { DataSource } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: __dirname + '/../.env.prod' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize:
    process.env.ENV_TYPE === 'dev' || process.env.ENV_TYPE === 'test',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  dropSchema: process.env.ENV_TYPE === 'test',
  logging: process.env.ENV_TYPE === 'dev',
  logger: 'file',
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsRun: false,
});

export default AppDataSource;
