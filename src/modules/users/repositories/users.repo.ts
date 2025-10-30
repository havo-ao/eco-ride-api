import { db } from '@/core/database/mysql';
import { RegisterUserDTO } from '../dtos/register.dto';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

type RegisterResult = RowDataPacket & {
  status: string;
  message: string;
  userId: number | null;
};

export async function registerUser(dto: RegisterUserDTO) {
  const passwordHash = await bcrypt.hash(dto.password, 10);

  await db.query('CALL sp_register_user(?, ?, ?, @status, @message, @user_id)', [
    dto.email,
    passwordHash,
    dto.fullName,
  ]);

  const [rows] = await db.query<RegisterResult[]>(
    'SELECT @status AS status, @message AS message, @user_id AS userId'
  );

  return rows[0]; 
}