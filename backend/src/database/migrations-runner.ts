import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  console.log('Running migrations...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'news_portal',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');

    await dataSource.runMigrations();
    console.log('✅ Migrations completed');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

runMigrations();