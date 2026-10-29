import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { CvService } from './cv.service.js';
import { SaveCvDto } from './dto/save-cv.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('api/cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  getCv(@CurrentUser('sub') userId: string) {
    return this.cvService.getCv(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('save')
  saveCv(@CurrentUser('sub') userId: string, @Body() dto: SaveCvDto) {
    return this.cvService.saveCv(userId, dto);
  }
}
