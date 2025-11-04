import { Request, Response, NextFunction } from "express";
import { AuthService, AuthError } from "./auth.service";

const service = new AuthService();

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email y contraseña son obligatorios" });
      }
      const result = await service.login(email, password);
      return res.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return res
          .status(error.status)
          .json({ message: error.message, code: error.code });
      }
      return next(error);
    }
  }
}
