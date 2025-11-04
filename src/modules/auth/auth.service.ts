import jwt, { SignOptions } from "jsonwebtoken";
import { AuthRepository, LoginUserRecord } from "./auth.repository";
import { env } from "../../core/config/env";

export interface LoginResult {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export class AuthError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class AuthService {
  private readonly repository = new AuthRepository();

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const user = await this.repository.login(email, password);
      const signOptions: SignOptions = {
        expiresIn: env.jwt.expiresIn,
      };
      const token = jwt.sign(
        { id: user.id, email: user.email },
        env.jwt.secret,
        signOptions
      );
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("INVALID_CREDENTIALS")) {
        throw new AuthError(
          401,
          "INVALID_CREDENTIALS",
          "Credenciales inválidas"
        );
      }
      throw error;
    }
  }
}
