import {Request, Response} from 'express';
import {commentService} from '../services/comment.service';
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('comments-controller');

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Crear un nuevo comentario
 *     description: Permite a un usuario enviar un comentario sobre una estación, bicicleta o viaje.
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - content
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 7
 *               content:
 *                 type: string
 *                 example: "Excelente servicio y bicicletas en buen estado."
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       201:
 *         description: Comentario creado correctamente
 *         content:
 *           application/json:
 *             example:
 *               id: 12
 *               userId: 7
 *               content: "Excelente servicio y bicicletas en buen estado."
 *               rating: 5
 *               createdAt: "2025-11-11T18:00:00Z"
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             example:
 *               message: "Faltan campos obligatorios"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               message: "Error interno del servidor"
 */
export async function createCommentController(req:Request, res: Response) {
    try{
    const result = await commentService.createComment(req.body);
    res.status(201).json(result);
  } catch(error){
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
    logger.error({ message: 'Error en createCommentController', error: (error as Error).message, stack: (error as Error).stack });
  }
    
}

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Obtener todos los comentarios
 *     description: Devuelve la lista completa de comentarios registrados en el sistema.
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Lista de comentarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 12
 *                   userId:
 *                     type: integer
 *                     example: 7
 *                   content:
 *                     type: string
 *                     example: "Excelente servicio y bicicletas en buen estado."
 *                   rating:
 *                     type: integer
 *                     example: 5
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-11-11T18:00:00Z"
 *       500:
 *         description: Error interno al obtener los comentarios
 *         content:
 *           application/json:
 *             example:
 *               message: "Error interno al obtener comentarios"
 */
export const getAllCommentsController = async (_req: Request, res: Response) => {
  try {
    const comments = await commentService.getAllComments();
    res.status(200).json(comments);
  } catch (error) {
    logger.error({ message: '[COMMENTS] Error al obtener comentarios', error: (error as Error).message, stack: (error as Error).stack });
    res.status(500).json({ message: 'Error interno al obtener comentarios' });
  }
};