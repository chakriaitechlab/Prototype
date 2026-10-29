import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { SupportService } from './support.service.js';
import { SupportContactDto } from './dto/support-contact.dto.js';

@Controller('api/support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @HttpCode(HttpStatus.OK)
  @Post('contact')
  contact(@Body() dto: SupportContactDto, @Ip() ip: string) {
    return this.supportService.submitContact(dto, ip);
  }
}
