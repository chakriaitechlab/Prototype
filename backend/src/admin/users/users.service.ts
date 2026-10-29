import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: ListUsersDto) {
    const { q, role, banned, page, limit } = dto;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(banned !== undefined && { isBanned: banned }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          isBanned: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async get(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        role: true,
        provider: true,
        emailVerified: true,
        phoneVerified: true,
        isBanned: true,
        onboardingCompleted: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
        company: { select: { id: true, name: true, username: true, isVerified: true } },
        _count: { select: { opportunities: true, applications: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateStatus(actorId: string, userId: string, dto: UpdateUserStatusDto) {
    const { isBanned } = dto;

    if (actorId === userId) {
      throw new BadRequestException('You cannot ban or unban your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Admin accounts cannot be banned');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { isBanned, tokenVersion: { increment: 1 } },
      select: { id: true, isBanned: true },
    });
  }
}
