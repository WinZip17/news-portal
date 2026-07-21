import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private configService: ConfigService) {
  }

  async onModuleInit() {
    await this.ensureDatabaseExists();
  }

  private async ensureDatabaseExists() {
    const dbConfig = {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'news_portal'),
    };

    this.logger.log('Checking database existence...');
    this.logger.log(`Target database: ${dbConfig.database}`);

    // Подключаемся к системной базе данных 'postgres'
    const client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: 'postgres', // Подключаемся к системной базе
    });

    try {
      await client.connect();
      this.logger.log('Connected to PostgreSQL server');

      // Проверяем существование базы данных
      const result = await client.query(
        `SELECT 1
         FROM pg_database
         WHERE datname = $1`,
        [dbConfig.database]
      );

      if (result.rows.length === 0) {
        // База данных не существует, создаем её
        this.logger.log(`Database "${dbConfig.database}" not found. Creating...`);

        await client.query(
          `CREATE DATABASE "${dbConfig.database}" 
           ENCODING 'UTF8' 
           LC_COLLATE = 'C' 
           LC_CTYPE = 'C' 
           TEMPLATE template0`
        );

        this.logger.log(`✅ Database "${dbConfig.database}" created successfully!`);
      } else {
        this.logger.log(`✅ Database "${dbConfig.database}" already exists`);
      }

      // Даем права пользователю
      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE "${dbConfig.database}" TO "${dbConfig.username}"`
      );

    } catch (error) {
      this.logger.error('Failed to ensure database exists:', error.message);

      // Пробуем создать базу данных альтернативным способом
      if (error.message.includes('does not exist') || error.message.includes('не существует')) {
        try {
          this.logger.log('Trying alternative method to create database...');

          await client.query(
            `CREATE DATABASE "${dbConfig.database}" ENCODING 'UTF8'`
          );

          this.logger.log(`✅ Database "${dbConfig.database}" created with alternative method`);
        } catch (createError) {
          this.logger.error('Alternative creation also failed:', createError.message);
          throw createError;
        }
      } else {
        throw error;
      }
    } finally {
      await client.end();
    }
  }
}