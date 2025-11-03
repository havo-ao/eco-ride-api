import { RegisterUserDTO } from '../dtos/register.dto';
import { registerUser } from '../repositories/users.repo';

export async function registerUserService(dto: RegisterUserDTO) {
  return await registerUser(dto);
}