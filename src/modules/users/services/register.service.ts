import { RegisterUserDTO } from '../dtos/register.dto';
import { registerUser } from '../repositories/users.repo';
import { sendEmail } from '../../email/email.service';
import { accountActivationTemplate } from '../../email/email.templates';
import { generateRawToken, hashToken } from '../../email/token.util';

export async function registerUserService(dto: RegisterUserDTO) {
  // Generate raw token and its hashed representation
  const rawToken = generateRawToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  // Attach to DTO so repository/SP can persist them
  dto.hashedToken = hashedToken;
  dto.tokenExpiration = tokenExpiration.toISOString();

  // Register user in DB
  const userRegistered = await registerUser(dto);

  // Send activation email with raw token (do not log the raw token in production)
  try {
    await sendEmail(
      dto.email,
      'Confirma tu cuenta EcoRide',
      accountActivationTemplate(rawToken)
    );
  } catch (err) {
    // Log email failures but don't fail the registration
    console.error('Failed to send activation email:', (err as Error).message);
  }

  return userRegistered;
}