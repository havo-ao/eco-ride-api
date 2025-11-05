import {CreateCommentDTO} from '../dtos/comment.dto';
import {createComment, getAllComments} from '../repositories/comment.repo';
import { Comment } from '../repositories/comment.repo'; 

export const commentService = {

  createComment: async (dto: CreateCommentDTO): Promise<void> => {
     await createComment(dto);
  },


  getAllComments: async (): Promise<Comment[]> => {
    return await getAllComments();
  },
};

