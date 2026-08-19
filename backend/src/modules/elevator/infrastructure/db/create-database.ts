import { Client, ClientConfig } from 'pg';

function getDatabaseName(): string {
  if (process.env.POSTGRES_DB) {
    return process.env.POSTGRES_DB;
  }

  if (process.env.DATABASE_URL) {
    return new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '');
  }

  return 'elevator_simulation';
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function getClientConfig(database: string): ClientConfig {
  if (!process.env.DATABASE_URL) {
    return {
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      user: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'postgres',
      database,
    };
  }

  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `/${database}`;

  return { connectionString: url.toString() };
}

async function createDatabaseIfMissing(): Promise<void> {
  const databaseName = getDatabaseName();
  const maintenanceDatabase = process.env.POSTGRES_MAINTENANCE_DB ?? 'postgres';

  const client = new Client(getClientConfig(maintenanceDatabase));

  await client.connect();

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`Created PostgreSQL database: ${databaseName}`);
      return;
    }

    console.log(`PostgreSQL database already exists: ${databaseName}`);
  } finally {
    await client.end();
  }
}

createDatabaseIfMissing().catch((error) => {
  console.error('Failed to create PostgreSQL database', error);
  process.exit(1);
});
