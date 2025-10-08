import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageFormatterService {
  format(msg: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${msg}`;
  }
}
