import { db } from "../../../core/database/mysql";
import { RegisterUserDTO } from "../dtos/register.dto";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

type RegisterResult = RowDataPacket & {
  status: string;
  message: string;
  userId: number | null;
};

function formatDateToMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function registerUser(
  dto: RegisterUserDTO,
  hashedToken: string,
  tokenExpiration: Date
) {
  const passwordHash = await bcrypt.hash(dto.password, 10);
  const formattedExpiration = formatDateToMySQL(tokenExpiration);

  console.log('Formatted expiration:', formattedExpiration);

  const [results]: any = await db.query(
    `CALL sp_register_user(?, ?, ?, ?, ?, ?, @status, @message, @user_id);
     SELECT @status AS status, @message AS message, @user_id AS userId;`,
    [dto.email, passwordHash, dto.firstName, dto.lastName, hashedToken, formattedExpiration]
  );

  const output = results[1][0];

  if (output.status !== 'OK') {
    throw new Error(output.message);
  }

  return {
    id: output.userId,
    message: output.message,
  };
}