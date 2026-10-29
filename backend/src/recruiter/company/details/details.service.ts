import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Company, Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { StorageService } from '../../../infrastructure/storage/storage.service.js';
import { CompletionService } from '../completion/completion.service.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

const DEFAULT_BANNER_POSITION = 50;

@Injectable()
export class DetailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly completionService: CompletionService,
  ) {}

  async getCompany(userId: string) {
    return this.toResponse(await this.findCompany(userId));
  }

  async updateCompany(userId: string, dto: UpdateCompanyDto) {
    const { foundedOn, removeBanner, tradeLicense, rlNo, socialLinks, ...fields } = dto;
    const company = await this.findCompany(userId);

    const data: Prisma.CompanyUpdateInput = {
      ...fields,
      ...(socialLinks !== undefined && { socialLinks: socialLinks.map(({ platform, url }) => ({ platform, url })) }),
      ...(foundedOn !== undefined && { foundedOn: foundedOn ? new Date(foundedOn) : null }),
      ...(removeBanner && { bannerUrl: null, bannerPosition: DEFAULT_BANNER_POSITION }),
    };

    if (!company.isVerified) {
      if (tradeLicense) await this.assertTradeLicenseAvailable(company.id, tradeLicense);
      if (tradeLicense !== undefined) data.tradeLicense = tradeLicense;
      if (rlNo !== undefined) data.rlNo = rlNo;
    }

    const updated = await this.prisma.company.update({ where: { id: company.id }, data });

    if (removeBanner && company.bannerUrl) await this.storageService.deleteFile(company.bannerUrl);

    return this.toResponse(updated);
  }

  async findCompany(userId: string) {
    const company = await this.prisma.company.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException('Company not found. Please complete onboarding first.');
    return company;
  }

  toResponse(company: Company) {
    return {
      id: company.id,
      name: company.name,
      username: company.username,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      bannerPosition: company.bannerPosition,
      about: company.about ?? '',
      organizationType: company.organizationType ?? '',
      industry: company.industry ?? '',
      teamSize: company.teamSize ?? '',
      foundedOn: company.foundedOn ? company.foundedOn.toISOString().slice(0, 10) : '',
      website: company.website ?? '',
      vision: company.vision ?? '',
      socialLinks: Array.isArray(company.socialLinks) ? company.socialLinks : [],
      mapLocation: company.mapLocation ?? '',
      address: company.address ?? '',
      city: company.city ?? '',
      country: company.country ?? '',
      lat: company.lat,
      lng: company.lng,
      tradeLicense: company.tradeLicense ?? '',
      rlNo: company.rlNo ?? '',
      isVerified: company.isVerified,
      completion: this.completionService.compute(company),
    };
  }

  private async assertTradeLicenseAvailable(companyId: string, tradeLicense: string) {
    const existing = await this.prisma.company.findFirst({
      where: { tradeLicense, id: { not: companyId } },
      select: { id: true },
    });
    if (existing) throw new ConflictException('This trade license is already registered on another account.');
  }
}
