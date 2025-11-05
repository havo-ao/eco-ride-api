import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
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
      const user: LoginUserRecord | null = await this.repository.findByEmail(
        email
      );

      if (!user) {
        throw new AuthError(
          401,
          "INVALID_CREDENTIALS",
          "Credenciales inválidas"
        );
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new AuthError(
          401,
          "INVALID_CREDENTIALS",
          "Credenciales inválidas"
        );
      }

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
      if (error instanceof AuthError) {
        throw error;
      }
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
