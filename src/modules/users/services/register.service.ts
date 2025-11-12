import { RegisterUserDTO } from '../dtos/register.dto';
import { registerUser } from '../repositories/users.repo';
import { sendEmail } from '../../email/email.service';
import { accountActivationTemplate } from '../../email/email.templates';
import { generateRawToken, hashToken } from '../../email/token.util';

export async function registerUserService(dto: RegisterUserDTO) {
  // Generar token
  const rawToken = generateRawToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  // Log para verificar
  console.log('Raw token:', rawToken);
  console.log('Hashed token:', hashedToken);
  console.log('Expiration:', tokenExpiration);

  // Registrar usuario en DB
  const userRegistered = await registerUser(dto, hashedToken, tokenExpiration);

  // Enviar correo con el token sin hash
  await sendEmail(
    dto.email,
    'Confirma tu cuenta EcoRide',
    accountActivationTemplate(rawToken)
  );

  return userRegistered;
}