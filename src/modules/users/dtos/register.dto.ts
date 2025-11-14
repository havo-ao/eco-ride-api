export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Optional fields used for token/email verification flows
  hashedToken?: string;
  tokenExpiration?: string | Date;
}