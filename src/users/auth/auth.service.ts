import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';
import { LoginDto } from '../login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userService.create(createUserDto);
    return user;
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;
    const existingUser = await this.userService.findOneByEmail(email);

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await this.passwordService.verify(password, existingUser.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(existingUser);
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, name: user.name };
    return this.jwtService.sign(payload);
  }
}
