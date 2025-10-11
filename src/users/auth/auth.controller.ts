import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../create-user.dto';
import { AuthService } from './auth.service';
import { User } from '../user.entity';
import { LoginDto } from '../login.dto';
import { LoginResponse } from '../login.response';
import { IAuthRequest } from './auth.request';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../auth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const accessToken = await this.authService.login(loginDto);
    return new LoginResponse({ accessToken });
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@Request() request: IAuthRequest): Promise<User> {
    const user = await this.userService.findOneById(request.user.sub);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
