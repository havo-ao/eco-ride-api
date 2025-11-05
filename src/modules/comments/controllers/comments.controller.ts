import {Request, Response} from 'express';
import {commentService} from '../services/comment.service';

export async function createCommentController(req:Request, res: Response) {
    try{
    const result = await commentService.createComment(req.body);
    res.status(201).json(result);
    } catch(error){
        res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
    console.error('Error en createCommentController:', error);
    }
    
}

export const getAllCommentsController = async (_req: Request, res: Response) => {
  try {
    const comments = await commentService.getAllComments();
    res.status(200).json(comments);
  } catch (error) {
    console.error('[COMMENTS] Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error interno al obtener comentarios' });
  }
};