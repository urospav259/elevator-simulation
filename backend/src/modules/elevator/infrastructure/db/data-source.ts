import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { ElevatorCallOrmEntity } from './typeorm/elevator-call.orm-entity';
import { ElevatorOrmEntity } from './typeorm/elevator.orm-entity';
import { CreateElevatorSchema20260812000000 } from './migrations/20260812000000-create-elevator-schema';
import { SeedInitialElevators20260812000100 } from './migrations/20260812000100-seed-initial-elevators';

const databaseUrl = process.env.DATABASE_URL;

export const ElevatorDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: databaseUrl ? undefined : process.env.POSTGRES_HOST ?? 'localhost',
  port: databaseUrl ? undefined : Number(process.env.POSTGRES_PORT ?? 5432),
  username: databaseUrl ? undefined : process.env.POSTGRES_USER ?? 'postgres',
  password: databaseUrl ? undefined : process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: databaseUrl ? undefined : process.env.POSTGRES_DB ?? 'elevator_simulation',
  entities: [ElevatorOrmEntity, ElevatorCallOrmEntity],
  migrations: [
    CreateElevatorSchema20260812000000,
    SeedInitialElevators20260812000100,
  ],
  synchronize: false,
  migrationsRun: false,
});
