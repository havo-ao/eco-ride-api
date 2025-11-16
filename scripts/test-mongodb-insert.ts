import 'dotenv/config';
import mongoose from 'mongoose';
async function main() {
  try {
    const uri = process.env.MONGOD_URI as string;
await mongoose.connect(uri, 
    { dbName: String(process.env.MONGOD_DB_NAME) });
    console.log('✅ Conectado a MongoDB (EcoRide)');

    const comentarioSchema = new mongoose.Schema({
      idViaje: { type: String, required: true },
      comentarioTexto: { type: String, required: true },
      puntaje: { type: Number, required: true },
    });

    const bucketSchema = new mongoose.Schema(
      {
        _id: { type: String, required: true }, 
        comentarios: [comentarioSchema],
      },
      { collection: String(process.env.MONGOD_DB_COLLECTION) }
    );

    const CommentBucket = mongoose.model('CommentBucket', bucketSchema);

    const idUsuario = 666;

    const nuevoComentario = {
      idViaje: 777,
      comentarioTexto: 'COMENTARIO CREADO DESDE MONGO TEST DB',
      puntaje: 5,
    };

    await CommentBucket.updateOne(
      { _id: idUsuario },
      { $push: { comentarios: nuevoComentario } },
      { upsert: true }
    );
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

main();