import 'dotenv/config';
import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
    });
    console.log('✅ Conexión exitosa a MySQL');
    await conn.end();
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

testConnection();