import { RegisterUserDTO } from '../dtos/register.dto';
import { registerUser } from '../repositories/users.repo';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function registerUserService(dto: RegisterUserDTO) {
  // Generate a verification token and expiration (24h)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Hash the token before persisting
  const hashedToken = await bcrypt.hash(rawToken, 10);

  // Attach to DTO so repository/SP can persist them
  dto.hashedToken = hashedToken;
  dto.tokenExpiration = tokenExpiration.toISOString();

  const result = await registerUser(dto);

  // Return DB result and the raw token so caller (likely controller) can email it
  return { db: result, token: rawToken };
}