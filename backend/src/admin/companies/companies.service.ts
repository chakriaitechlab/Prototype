import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { ListCompaniesDto } from './dto/list-companies.dto.js';
import { UpdateCompanyVerificationDto } from './dto/update-company-verification.dto.js';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: ListCompaniesDto) {
    const { q, verified, page, limit } = dto;

    const where: Prisma.CompanyWhereInput = {
      ...(verified !== undefined && { isVerified: verified }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [companies, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          logoUrl: true,
          isVerified: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { opportunities: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      items: companies.map((company) => ({
        id: company.id,
        name: company.name,
        username: company.username,
        logoUrl: company.logoUrl,
        isVerified: company.isVerified,
        owner: company.user,
        jobCount: company._count.opportunities,
        createdAt: company.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async get(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        username: true,
        logoUrl: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, isBanned: true } },
        _count: { select: { opportunities: true } },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    return company;
  }

  async updateVerification(companyId: string, dto: UpdateCompanyVerificationDto) {
    const { isVerified } = dto;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.prisma.company.update({
      where: { id: company.id },
      data: { isVerified },
      select: { id: true, isVerified: true },
    });
  }
}
