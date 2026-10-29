import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const CV_MAX_BYTES = 10 * 1024 * 1024;

export const PROJECT_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PROJECT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const COMPANY_BANNER_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const COMPANY_BANNER_MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    this.bucketName = this.configService.get<string>('R2_BUCKET') || 'chakri-user';
    this.publicUrl = (this.configService.get<string>('R2_PUBLIC_BASE_URL') || '').replace(/\/$/, '');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      forcePathStyle: false,
    });
  }

  uploadAvatar(file: UploadFile, userEmail: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.jpg';
    return this.upload(file, `${userEmail.trim().toLowerCase()}/profile/avatar${ext}`);
  }

  uploadCv(file: UploadFile, userEmail: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.pdf';
    return this.upload(file, `${userEmail.trim().toLowerCase()}/cv/resume${ext}`);
  }

  uploadApplicationCv(file: UploadFile, userEmail: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.pdf';
    return this.upload(file, `${userEmail.trim().toLowerCase()}/applications/${randomUUID()}${ext}`);
  }

  uploadProjectPhoto(file: UploadFile, userEmail: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.jpg';
    return this.upload(file, `${userEmail.trim().toLowerCase()}/projects/${randomUUID()}${ext}`);
  }

  uploadCompanyLogo(file: UploadFile, userEmail: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.jpg';
    return this.upload(file, `${userEmail.trim().toLowerCase()}/company/logo${ext}`);
  }

  uploadCompanyBanner(file: UploadFile, userEmail: string): Promise<string> {
    const ext = path.extname(file.originalname) || '.jpg';
    return this.upload(file, `${userEmail.trim().toLowerCase()}/company/banner${ext}`);
  }

  async deleteFile(url: string): Promise<void> {
    const key = this.keyFromUrl(url);
    if (!key) return;

    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to delete ${key}: ${error.message}`, error.stack);
    }
  }

  deleteUserFiles(userEmail: string): Promise<void> {
    return this.deletePrefix(`${userEmail.trim().toLowerCase()}/`);
  }

  private async deletePrefix(prefix: string): Promise<void> {
    try {
      let continuationToken: string | undefined;
      do {
        const page = await this.s3Client.send(
          new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken,
          }),
        );
        const objects = (page.Contents ?? []).flatMap(({ Key }) => (Key ? [{ Key }] : []));
        if (objects.length) {
          await this.s3Client.send(
            new DeleteObjectsCommand({ Bucket: this.bucketName, Delete: { Objects: objects } }),
          );
        }
        continuationToken = page.NextContinuationToken;
      } while (continuationToken);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to delete files under ${prefix}: ${error.message}`, error.stack);
    }
  }

  private keyFromUrl(url: string): string | null {
    const prefix = `${this.publicUrl}/`;
    if (!url.startsWith(prefix)) return null;
    return decodeURIComponent(url.slice(prefix.length).split('?')[0]) || null;
  }

  private async upload(file: UploadFile, key: string): Promise<string> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return `${this.publicUrl}/${key}?v=${Date.now()}`;
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to upload ${key}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload file. Please try again.');
    }
  }
}
