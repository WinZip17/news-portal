import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'news_portal',
  };

  console.log('Creating database...');
  console.log('Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
  });

  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Проверяем существование БД
    const result = await client.query(
      `SELECT 1
       FROM pg_database
       WHERE datname = $1`,
      [dbConfig.database]
    );

    if (result.rows.length === 0) {
      // Создаем БД
      await client.query(
        `CREATE DATABASE "${dbConfig.database}" 
         ENCODING 'UTF8' 
         LC_COLLATE = 'C' 
         LC_CTYPE = 'C' 
         TEMPLATE template0`
      );
      console.log(`✅ Database "${dbConfig.database}" created`);
    } else {
      console.log(`Database "${dbConfig.database}" already exists`);
    }

    // Права
    await client.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${dbConfig.database}" TO "${dbConfig.user}"`
    );
    console.log('✅ Privileges granted');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();