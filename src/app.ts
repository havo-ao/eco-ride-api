import express from "express";
import cors from "cors";

import { registerUserController } from './modules/users/controllers/register.controller';
import { createCommentController,getAllCommentsController } from './modules/comments/controllers/comments.controller';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/users/register', registerUserController);
app.post('/api/comments/postComment', createCommentController);
app.get('/api/comments/userComments', getAllCommentsController);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

export default app;
