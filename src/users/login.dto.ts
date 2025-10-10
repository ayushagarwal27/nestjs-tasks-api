import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNotEmpty({ message: "password can't be empty" })
  @MinLength(6)
  password: string;
}
