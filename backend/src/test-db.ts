import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Config:', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        database: process.env.DB_DATABASE || 'news_portal',
    });

    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'news_portal',
        logging: true,
    });

    try {
        await dataSource.initialize();
        console.log('✅ Connection successful!');

        // Проверяем существующие таблицы
        const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Existing tables:', tables);

        await dataSource.destroy();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();