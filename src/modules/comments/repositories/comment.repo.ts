import { getMongoConnection } from '../../../core/database/mongodb';
import { CreateCommentDTO } from '../dtos/comment.dto';

export type Comment = {
  idViaje: number;
  comentarioTexto: string;
  puntaje: number;
  date: Date;
  status: 'Active' | 'Reported' | 'Deleted';
};
export type userBucket = {
  _id: number; 
  nombreUsuario: string;
  comentarios: Comment[];
};

export type CommentWithUser = Comment & {nombreUsuario:string};
export async function createComment(dto: CreateCommentDTO) {
  const conn = getMongoConnection(); 
  const collection = conn.collection<userBucket>('ecorideComments');

  return await collection.updateOne(
    { _id: dto.idUsuario},
    {$setOnInsert: {nombreUsuario: dto.nombreUsuario}, 
      $push: {
        comentarios: {
          idViaje: dto.idViaje,
          comentarioTexto: dto.comentarioTexto,
          puntaje: dto.puntaje,
          date: new Date(),
          status: "Active"
        },
      }
    },
    { upsert: true }
  );
}

export async function getAllComments(): Promise<Comment[]> {
  const conn = getMongoConnection();
  const collection = conn.collection<userBucket>('ecorideComments');

  const pipeline = [
    { $unwind: '$comentarios' }, 
    { $match: { 'comentarios.status': 'Active' } },
    {
      $project: {
        _id: 0,
        nombreUsuario: '$nombreUsuario',
        idViaje: '$comentarios.idViaje',
        comentarioTexto: '$comentarios.comentarioTexto',
        puntaje: '$comentarios.puntaje',
        date: '$comentarios.date', 
        status: '$comentarios.status',
      },
    },
    { $sort: { date: -1 } }, 
  ];

  const results = await collection.aggregate<Comment>(pipeline).toArray();
  return results;
}