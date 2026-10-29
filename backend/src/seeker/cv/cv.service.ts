import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import type { SaveCvDto } from './dto/save-cv.dto.js';

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCv(userId: string) {
    const cv = await this.prisma.cVProfile.findUnique({
      where: { userId },
    });

    if (cv) {
      const parsedData = (cv.parsedData as Record<string, any>) || {};
      return {
        file_path: cv.filePath,
        parsed_data: parsedData,
        uploaded_at: cv.createdAt.toISOString(),
      };
    }

    // Fallback: Populate initial draft from existing SeekerProfile if available
    const seeker = await this.prisma.seekerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!seeker) {
      return null;
    }

    const skillsArray = Array.isArray(seeker.skills)
      ? seeker.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
      : [];

    const initialDraft: Record<string, any> = {
      fullName: seeker.user?.name || '',
      email: seeker.user?.email || '',
      phone: seeker.user?.phoneNumber || '',
      location: seeker.location || '',
      headline: seeker.headline || '',
      summary: seeker.about || '',
      skills: skillsArray,
      experience: seeker.experience || [],
      education: seeker.education || [],
      projects: seeker.projects || [],
      certifications: seeker.certifications || [],
      languages: seeker.languages || [],
    };

    return {
      file_path: seeker.cvUrl || null,
      parsed_data: initialDraft,
      uploaded_at: seeker.createdAt.toISOString(),
    };
  }

  async saveCv(userId: string, body: SaveCvDto) {
    const profile = (body?.profile && typeof body.profile === 'object' ? body.profile : body) || {};

    if (!profile || typeof profile !== 'object') {
      throw new BadRequestException('CV Profile data is required');
    }

    // 1. Save or update CVProfile table
    await this.prisma.cVProfile.upsert({
      where: { userId },
      update: {
        filePath: 'builder',
        fileType: 'json',
        parsedData: profile,
      },
      create: {
        userId,
        filePath: 'builder',
        fileType: 'json',
        parsedData: profile,
      },
    });

    // 2. Sync to SeekerProfile table
    const skillsList = Array.isArray(profile.skills)
      ? profile.skills.map((s: any) => (typeof s === 'string' ? { name: s, level: 'intermediate' } : s))
      : [];

    await this.prisma.seekerProfile.upsert({
      where: { userId },
      update: {
        headline: profile.headline || undefined,
        about: profile.summary || undefined,
        location: profile.location || undefined,
        skills: skillsList.length ? skillsList : undefined,
        experience: Array.isArray(profile.experience) ? profile.experience : undefined,
        education: Array.isArray(profile.education) ? profile.education : undefined,
        projects: Array.isArray(profile.projects) ? profile.projects : undefined,
        certifications: Array.isArray(profile.certifications) ? profile.certifications : undefined,
        languages: Array.isArray(profile.languages) ? profile.languages : undefined,
      },
      create: {
        userId,
        headline: profile.headline || null,
        about: profile.summary || null,
        location: profile.location || null,
        skills: skillsList,
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        projects: Array.isArray(profile.projects) ? profile.projects : [],
        certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
        languages: Array.isArray(profile.languages) ? profile.languages : [],
      },
    });

    // 3. Update User's name if provided and valid
    const candidateName = profile.fullName || profile.name;
    if (candidateName && typeof candidateName === 'string') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: candidateName.trim() },
      });
    }

    this.logger.log(`CV Profile saved and synced successfully for user: ${userId}`);

    return {
      ok: true,
      parsed_data: profile,
    };
  }
}
