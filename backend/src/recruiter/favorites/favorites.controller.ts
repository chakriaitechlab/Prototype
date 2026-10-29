import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { FavoritesService } from './favorites.service.js';
import { SaveFavoriteDto } from './dto/save-favorite.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECRUITER')
@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.favoritesService.list(userId);
  }

  @Post()
  save(@CurrentUser('sub') userId: string, @Body() dto: SaveFavoriteDto) {
    return this.favoritesService.save(userId, dto);
  }

  @Delete(':candidateId')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('candidateId', ParseUUIDPipe) candidateId: string,
  ) {
    return this.favoritesService.remove(userId, candidateId);
  }
}
