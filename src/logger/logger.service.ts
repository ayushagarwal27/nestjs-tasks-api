import { Injectable } from '@nestjs/common';
import { MessageFormatterService } from 'src/message-formatter/message-formatter.service';

@Injectable()
export class LoggerService {
  constructor(
    private readonly messageFormatterService: MessageFormatterService,
  ) {}
  log(message: string) {
    const result = this.messageFormatterService.format(message);
    console.log(result);
    return result;
  }
}
