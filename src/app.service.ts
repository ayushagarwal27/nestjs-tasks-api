import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { AppConfig } from './config/app.config';
import { TypedConfigService } from './config/typed-config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: TypedConfigService,
  ) {}

  getHello(): string {
    console.log(this.configService.get<AppConfig>('app')?.messagePrefix);
    return this.loggerService.log('Hello World!');
  }
}
