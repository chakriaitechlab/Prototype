import { Body, Controller, Ip, Post } from '@nestjs/common';
import { WaitlistService } from './waitlist.service.js';
import { JoinWaitlistDto } from './dto/join-waitlist.dto.js';

@Controller('api/waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  join(@Body() dto: JoinWaitlistDto, @Ip() ip: string) {
    return this.waitlistService.join(dto, ip);
  }
}
