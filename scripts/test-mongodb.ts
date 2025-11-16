import 'dotenv/config';
import mongoose from 'mongoose';


async function testConnection() {
  try {
    const uri = process.env.MONGOD_URI as string;
    const conn = await mongoose.connect(uri);
    console.log('✅ Conexión exitosa a MONGODB 😱');
    await conn.connection.close();
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

testConnection();