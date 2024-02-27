import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const typeormConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: +configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    synchronize: true,
    // configService.get('ENV_TYPE') === 'dev' ||
    // configService.get('ENV_TYPE') === 'test',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    dropSchema: configService.get('ENV_TYPE') === 'test',
    logging: configService.get('ENV_TYPE') === 'dev',
    logger: 'file',
    migrationsTableName: 'migrations',
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false,
  }),
  dataSourceFactory: async (options) => {
    return await new DataSource(options).initialize();
  },
};

export default typeormConfig;
