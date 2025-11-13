import {Request, Response} from 'express';
import {commentService} from '../services/comment.service';
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('comments-controller');

export async function createCommentController(req:Request, res: Response) {
    try{
    const result = await commentService.createComment(req.body);
    res.status(201).json(result);
  } catch(error){
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
    logger.error({ message: 'Error en createCommentController', error: (error as Error).message, stack: (error as Error).stack });
  }
    
}

export const getAllCommentsController = async (_req: Request, res: Response) => {
  try {
    const comments = await commentService.getAllComments();
    res.status(200).json(comments);
  } catch (error) {
    logger.error({ message: '[COMMENTS] Error al obtener comentarios', error: (error as Error).message, stack: (error as Error).stack });
    res.status(500).json({ message: 'Error interno al obtener comentarios' });
  }
};