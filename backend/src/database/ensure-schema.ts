import { Client } from 'pg';

const TYPEORM_METADATA_DDL = `
  CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
    "type" character varying NOT NULL,
    "database" character varying,
    "schema" character varying,
    "table" character varying,
    "name" character varying,
    "value" text
  );
`;

const SEARCH_VECTOR_EXPRESSION = `
  to_tsvector(
    'russian',
    coalesce(title, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(replace(tags, ',', ' '), '')
  )
`.trim();

function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'news_portal',
  };
}

/** Создаёт typeorm_metadata до инициализации TypeORM (нужна для GENERATED-колонок). */
export async function ensureDatabaseSchema(): Promise<void> {
  const dbConfig = getDbConfig();
  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  try {
    await client.connect();
    await client.query(TYPEORM_METADATA_DDL);

    const column = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'news'
           AND column_name = 'search_vector'
       ) AS exists`,
    );

    if (column.rows[0]?.exists) {
      await client.query(
        `DELETE FROM "typeorm_metadata"
         WHERE "type" = 'GENERATED_COLUMN'
           AND "schema" = 'public'
           AND "table" = 'news'
           AND "name" = 'search_vector'`,
      );

      await client.query(
        `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value")
         VALUES ($1, 'public', 'news', 'GENERATED_COLUMN', 'search_vector', $2)`,
        [dbConfig.database, SEARCH_VECTOR_EXPRESSION],
      );
    }
  } finally {
    await client.end();
  }
}
