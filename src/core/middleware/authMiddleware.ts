// src/core/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthPayload {
  id: number;
  email: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autenticado" });
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, env.jwt.secret) as AuthPayload;
    (req as any).user = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
