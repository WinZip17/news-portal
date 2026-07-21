import { Client } from 'pg';

async function ensureDatabaseExists() {
  const dbName = process.env.DB_DATABASE || 'news_portal';
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');

  console.log('🔧 Pre-initialization: Checking database...');
  console.log(`   Target database: ${dbName}`);
  console.log(`   Host: ${dbHost}:${dbPort}`);

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres', // Подключаемся к стандартной базе
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Проверяем существование базы данных
    const result = await client.query(
      `SELECT 1
       FROM pg_database
       WHERE datname = $1`,
      [dbName],
    );

    if (result.rows.length === 0) {
      console.log(`📦 Database "${dbName}" not found. Creating...`);

      // Создаем базу данных
      await client.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`);

      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }

    // Даем права
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`);
  } catch (error) {
    console.error('❌ Failed to ensure database exists:', error.message);

    // Пробуем альтернативный метод
    try {
      console.log('🔄 Trying alternative creation method...');
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created with alternative method`);
    } catch (createError) {
      console.error('❌ Alternative creation also failed:', createError.message);
      // Не выбрасываем ошибку, возможно база уже существует
    }
  } finally {
    await client.end();
  }
}

// Запускаем перед основным приложением
ensureDatabaseExists()
  .then(() => {
    console.log('✅ Database check completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  });
