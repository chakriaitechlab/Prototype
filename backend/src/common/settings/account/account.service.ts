import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { StorageService } from '../../../infrastructure/storage/storage.service.js';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async deleteAccount(userId: string) {
    const { email } = await this.prisma.user.delete({ where: { id: userId }, select: { email: true } });

    await this.storageService.deleteUserFiles(email);

    return { message: 'Your account has been deleted.' };
  }
}
