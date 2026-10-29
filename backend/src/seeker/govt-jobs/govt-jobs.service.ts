import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { Cron, Timeout } from '@nestjs/schedule';

const TELETALK_ORIGIN = 'https://alljobs.teletalk.com.bd';

// Teletalk stores media as relative paths; the browser needs absolute URLs.
function teletalkMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, '');
  return clean.startsWith('media/') ? `${TELETALK_ORIGIN}/${clean}` : `${TELETALK_ORIGIN}/media/${clean}`;
}

interface GovtJobsQuery {
  search?: string;
  organization?: string;
  status?: 'all' | 'active' | 'expired';
  page?: number;
  limit?: number;
  sortBy?: 'deadline' | 'latest' | 'published';
}

@Injectable()
export class GovtJobsService {
  private readonly logger = new Logger(GovtJobsService.name);
  private readonly baseUrl = `${TELETALK_ORIGIN}/api/v1`;
  private readonly upstreamTimeoutMs = 15_000;
  private isSyncing = false;

  constructor(private readonly prisma: PrismaService) {}

  @Timeout(5000)
  async initialGovtJobsSync(): Promise<void> {
    await this.syncGovtJobs();
  }

  @Cron('0 */15 * * * *')
  async syncGovtJobs(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Government-jobs sync is already running');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Scheduled government-jobs sync started');

    try {
      await this.syncJobsFromUpstream();
      this.logger.log('Scheduled government-jobs sync completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Scheduled government-jobs sync failed: ${message}`);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncJobsFromUpstream(): Promise<void> {
    let page = 1;
    const allJobs: any[] = [];

    while (true) {
      this.logger.log(`Fetching job list page ${page}...`);
      const url = `${this.baseUrl}/govt-jobs/list?page=${page}`;

      const res = await fetch(url, {
        signal: AbortSignal.timeout(this.upstreamTimeoutMs),
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!res.ok) {
        this.logger.error(`Failed to fetch page ${page}: ${res.status}`);
        break;
      }

      const data = await res.json();
      const jobs = data.govtJobs || [];
      if (jobs.length === 0) break;

      allJobs.push(...jobs);

      if (allJobs.length >= (data.count || 0)) {
        break;
      }

      page++;
    }

    this.logger.log(`Total jobs fetched from list: ${allJobs.length}`);

    this.logger.log(`Saving ${allJobs.length} jobs to database...`);

    for (const j of allJobs) {
      if (!j || !j.id) continue;

      const org = j.job_utilities_govtorganization;

      if (org && org.id) {
        await this.prisma.govtOrganization.upsert({
          where: { id: org.id },
          update: {
            name: org.name,
            nameBn: org.name_bn || null,
            shortName: org.short_name,
            logo: org.logo,
            website: org.website,
          },
          create: {
            id: org.id,
            name: org.name,
            nameBn: org.name_bn || null,
            shortName: org.short_name,
            logo: org.logo,
            website: org.website,
          },
        });
      }

      await this.prisma.govtJob.upsert({
        where: { id: j.id },
        update: {
          jobTitle: j.job_title,
          jobTitleBn: j.job_title_bn,
          jobId: j.job_id,
          applicationSite: j.application_site,
          vacancy: String(j.vacancy),
          vacancyNotSpecific: Boolean(j.vacancy_not_specific),
          publishedDate: new Date(j.published_date),
          deadlineDate: new Date(j.deadline_date),
          viewCount: Number(j.view_count) || 0,
          organizationId: Number(j.organization_id),
          createdAt: new Date(j.created_at),
        },
        create: {
          id: j.id,
          jobTitle: j.job_title,
          jobTitleBn: j.job_title_bn,
          jobId: j.job_id,
          applicationSite: j.application_site,
          vacancy: String(j.vacancy),
          vacancyNotSpecific: Boolean(j.vacancy_not_specific),
          publishedDate: new Date(j.published_date),
          deadlineDate: new Date(j.deadline_date),
          viewCount: Number(j.view_count) || 0,
          organizationId: Number(j.organization_id),
          createdAt: new Date(j.created_at),
        },
      });
    }

    this.logger.log(`Successfully saved ${allJobs.length} jobs to database.`);
  }

  async getAllJobList(query: GovtJobsQuery = {}) {
    const requestedPage = Number.isFinite(query.page) ? Number(query.page) : 1;
    const requestedLimit = Number.isFinite(query.limit)
      ? Number(query.limit)
      : 20;
    const page = Math.max(1, Math.floor(requestedPage));
    const limit = Math.min(500, Math.max(1, Math.floor(requestedLimit)));
    const search = query.search?.trim();
    const organization = query.organization?.trim();
    const now = new Date();

    const where: Prisma.GovtJobWhereInput = {};
    const filters: Prisma.GovtJobWhereInput[] = [];

    if (search) {
      filters.push({
        OR: [
          { jobTitle: { contains: search, mode: 'insensitive' } },
          { jobTitleBn: { contains: search, mode: 'insensitive' } },
          { jobId: { contains: search, mode: 'insensitive' } },
          { organization: { name: { contains: search, mode: 'insensitive' } } },
          {
            organization: { nameBn: { contains: search, mode: 'insensitive' } },
          },
        ],
      });
    }

    if (organization) {
      filters.push({
        organization: {
          OR: [
            { name: { contains: organization, mode: 'insensitive' } },
            { nameBn: { contains: organization, mode: 'insensitive' } },
            { shortName: { equals: organization, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (query.status === 'active') {
      filters.push({ deadlineDate: { gte: now } });
    } else if (query.status === 'expired') {
      filters.push({ deadlineDate: { lt: now } });
    }

    if (filters.length > 0) where.AND = filters;

    const orderBy: Prisma.GovtJobOrderByWithRelationInput[] =
      query.sortBy === 'deadline'
        ? [{ deadlineDate: 'asc' }, { id: 'desc' }]
        : query.sortBy === 'published'
        ? [{ publishedDate: 'desc' }, { id: 'desc' }]
        : [{ id: 'desc' }];

    const [total, jobs] = await Promise.all([
      this.prisma.govtJob.count({ where }),
      this.prisma.govtJob.findMany({
        where,
        select: {
          id: true,
          jobTitle: true,
          jobTitleBn: true,
          vacancy: true,
          vacancyNotSpecific: true,
          publishedDate: true,
          deadlineDate: true,
          viewCount: true,
          organization: {
            select: {
              name: true,
              nameBn: true,
              shortName: true,
              logo: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const data = jobs.map((j) => ({
      id: j.id,
      job_title: j.jobTitle,
      job_title_bn: j.jobTitleBn,
      vacancy: j.vacancy,
      vacancy_not_specific: j.vacancyNotSpecific,
      published_date: j.publishedDate?.toISOString(),
      deadline_date: j.deadlineDate?.toISOString(),
      view_count: j.viewCount,
      job_utilities_govtorganization: j.organization
        ? {
            name: j.organization.name,
            name_bn: j.organization.nameBn,
            short_name: j.organization.shortName,
            logo: teletalkMediaUrl(j.organization.logo),
          }
        : null,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        lastSyncedAt: null,
        syncStatus: 'SUCCESS',
      },
    };
  }

  async getJobDetails(
    jobId: number | string,
  ): Promise<Record<string, any> | null> {
    const numericId = Number(jobId);
    if (isNaN(numericId)) return null;

    try {
      const url = `${this.baseUrl}/govt-jobs/public-details?id=${numericId}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(this.upstreamTimeoutMs),
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.details) {
          const d = data.details;
          const org = d.job_utilities_govtorganization;

          if (org && org.id) {
            await this.prisma.govtOrganization.upsert({
              where: { id: org.id },
              update: {
                name: org.name,
                nameBn: org.name_bn || null,
                shortName: org.short_name,
                logo: org.logo,
                website: org.website,
                details: org.details !== 'N/A' ? org.details : null,
              },
              create: {
                id: org.id,
                name: org.name,
                nameBn: org.name_bn || null,
                shortName: org.short_name,
                logo: org.logo,
                website: org.website,
                details: org.details !== 'N/A' ? org.details : null,
              },
            });
          }

          await this.prisma.govtJob.upsert({
            where: { id: d.id },
            update: {
              jobTitle: d.job_title,
              jobTitleBn: d.job_title_bn,
              jobId: d.job_id,
              apiStatus: data.status,
              apiStatusCode: data.statusCode,
              apiMessageEn: data.message?.en,
              apiMessageBn: data.message?.bn,
              jobType: d.job_type,
              vacancy: String(d.vacancy),
              vacancyNotSpecific: Boolean(d.vacancy_not_specific),
              gender: d.gender,
              minAge: d.min_age,
              maxAge: d.max_age,
              applicationSite: d.application_site,
              jobSource: d.job_source,
              advertisementFile: d.advertisement_file,
              advertisementNo: d.advertisement_no?.trim() || null,
              advertisementPublishedDate: d.advertisement_published_date
                ? new Date(d.advertisement_published_date)
                : null,
              publishedDate: new Date(d.published_date),
              deadlineDate: new Date(d.deadline_date),
              admitCard: d.admit_card,
              admitCardUpload: d.admit_card_upload,
              admitCardText: d.admit_card_text,
              downloadUrl: d.download_url,
              downloadStartDate: d.download_start_date
                ? new Date(d.download_start_date)
                : null,
              downloadEndDate: d.download_end_date
                ? new Date(d.download_end_date)
                : null,
              isResult: d.is_result,
              resultUpload: d.result_upload,
              isNotice: d.is_notice,
              noticeUpload: d.notice_upload,
              noticeDownloadUrl: d.notice_download_url,
              noticeText: d.notice_text,
              viewCount: Number(d.view_count) || 0,
              status: d.status,
              organizationId: Number(
                d.job_utilities_govtorganization?.id || d.organization_id,
              ),
            },
            create: {
              id: d.id,
              jobTitle: d.job_title,
              jobTitleBn: d.job_title_bn,
              jobId: d.job_id,
              apiStatus: data.status,
              apiStatusCode: data.statusCode,
              apiMessageEn: data.message?.en,
              apiMessageBn: data.message?.bn,
              jobType: d.job_type,
              vacancy: String(d.vacancy),
              vacancyNotSpecific: Boolean(d.vacancy_not_specific),
              gender: d.gender,
              minAge: d.min_age,
              maxAge: d.max_age,
              applicationSite: d.application_site,
              jobSource: d.job_source,
              advertisementFile: d.advertisement_file,
              advertisementNo: d.advertisement_no?.trim() || null,
              advertisementPublishedDate: d.advertisement_published_date
                ? new Date(d.advertisement_published_date)
                : null,
              publishedDate: new Date(d.published_date),
              deadlineDate: new Date(d.deadline_date),
              createdAt: new Date(),
              admitCard: d.admit_card,
              admitCardUpload: d.admit_card_upload,
              admitCardText: d.admit_card_text,
              downloadUrl: d.download_url,
              downloadStartDate: d.download_start_date
                ? new Date(d.download_start_date)
                : null,
              downloadEndDate: d.download_end_date
                ? new Date(d.download_end_date)
                : null,
              isResult: d.is_result,
              resultUpload: d.result_upload,
              isNotice: d.is_notice,
              noticeUpload: d.notice_upload,
              noticeDownloadUrl: d.notice_download_url,
              noticeText: d.notice_text,
              viewCount: Number(d.view_count) || 0,
              status: d.status,
              organizationId: Number(
                d.job_utilities_govtorganization?.id || d.organization_id,
              ),
            },
          });

          if (Array.isArray(d.package_wise_govt_jobs)) {
            for (const pkgItem of d.package_wise_govt_jobs) {
              if (!pkgItem || !pkgItem.package_id) continue;

              if (pkgItem.govt_job_package) {
                await this.prisma.govtJobPackage.upsert({
                  where: { id: pkgItem.package_id },
                  update: {
                    name: pkgItem.govt_job_package.name,
                    description: pkgItem.govt_job_package.description || '',
                  },
                  create: {
                    id: pkgItem.package_id,
                    name: pkgItem.govt_job_package.name,
                    description: pkgItem.govt_job_package.description || '',
                  },
                });
              }

              await this.prisma.govtJobPackageAssignment.upsert({
                where: { id: pkgItem.id },
                update: {
                  jobId: d.id,
                  packageId: pkgItem.package_id,
                  startDate: new Date(pkgItem.start_date),
                  endDate: new Date(pkgItem.end_date),
                },
                create: {
                  id: pkgItem.id,
                  jobId: d.id,
                  packageId: pkgItem.package_id,
                  startDate: new Date(pkgItem.start_date),
                  endDate: new Date(pkgItem.end_date),
                },
              });
            }
          }
        }
      } else {
        this.logger.warn(
          `Failed to fetch upstream details for job ${numericId}: HTTP ${res.status}`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error fetching details for job ${numericId}: ${error.message}`,
      );
    }

    const job = await this.prisma.govtJob.findUnique({
      where: { id: numericId },
      include: {
        organization: true,
        packages: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!job) return null;

    return {
      status: job.apiStatus || 'success',
      statusCode: job.apiStatusCode || 200,
      message: {
        en: job.apiMessageEn || 'Government job fetch successful',
        bn: job.apiMessageBn || 'সরকারি চাকরির তথ্য সফলভাবে আনা হয়েছে',
      },
      details: {
        id: job.id,
        job_title: job.jobTitle,
        job_title_bn: job.jobTitleBn,
        job_id: job.jobId,
        job_type: job.jobType,
        vacancy: job.vacancy,
        gender: job.gender,
        min_age: job.minAge,
        max_age: job.maxAge,
        application_site: job.applicationSite,
        advertisement_file: teletalkMediaUrl(job.advertisementFile),
        published_date: job.publishedDate?.toISOString(),
        deadline_date: job.deadlineDate?.toISOString(),
        advertisement_no: job.advertisementNo,
        advertisement_published_date: job.advertisementPublishedDate
          ? job.advertisementPublishedDate.toISOString().split('T')[0]
          : null,
        admit_card: job.admitCard,
        is_result: job.isResult,
        is_notice: job.isNotice,
        job_source: job.jobSource,
        admit_card_upload: job.admitCardUpload,
        download_url: job.downloadUrl,
        download_start_date: job.downloadStartDate?.toISOString() || null,
        download_end_date: job.downloadEndDate?.toISOString() || null,
        admit_card_text: job.admitCardText,
        result_upload: job.resultUpload,
        notice_upload: job.noticeUpload,
        notice_download_url: job.noticeDownloadUrl,
        notice_text: job.noticeText,
        vacancy_not_specific: job.vacancyNotSpecific,
        view_count: job.viewCount,
        status: job.status,
        job_utilities_govtorganization: job.organization
          ? {
              id: job.organization.id,
              name: job.organization.name,
              name_bn: job.organization.nameBn,
              short_name: job.organization.shortName,
              logo: teletalkMediaUrl(job.organization.logo),
              website: job.organization.website,
              details: job.organization.details || 'N/A',
            }
          : null,
        circular_details: (job as any).circularDetails || null,
        package_wise_govt_jobs: (job.packages || []).map((p) => ({
          id: p.id,
          job_id: p.jobId,
          package_id: p.packageId,
          start_date: p.startDate
            ? p.startDate.toISOString().split('T')[0]
            : null,
          end_date: p.endDate ? p.endDate.toISOString().split('T')[0] : null,
          govt_job_package: p.package
            ? {
                name: p.package.name,
                description: p.package.description,
              }
            : null,
        })),
      },
    };
  }

  async updateCircularDetails(jobId: number | string, circularDetails: any): Promise<any> {
    const numericId = Number(jobId);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid job ID');
    }

    const existing = await this.prisma.govtJob.findFirst({
      where: {
        OR: [
          { id: numericId },
          { jobId: String(jobId) },
        ],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Government job with ID ${jobId} not found`);
    }

    const updated = await this.prisma.govtJob.update({
      where: { id: existing.id },
      data: {
        circularDetails: circularDetails as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      message: 'Circular details updated successfully',
      jobId: updated.id,
      circularDetails: updated.circularDetails,
    };
  }
}
