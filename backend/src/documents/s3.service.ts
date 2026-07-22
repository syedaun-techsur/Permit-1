import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class S3Service {
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.bucket =
      process.env.MINIO_BUCKET_NAME ||
      process.env.MINIO_BUCKET ||
      'permits-documents';
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  /**
   * Returns a presigned PUT URL valid for expiresInSeconds (default 900 = 15 min).
   * storageKey format: '{applicationId}/{uuid}-{filename}'
   */
  async getPresignedPutUrl(
    storageKey: string,
    expiresInSeconds = 900,
  ): Promise<string> {
    return this.client.presignedPutObject(
      this.bucket,
      storageKey,
      expiresInSeconds,
    );
  }

  /**
   * Returns a presigned GET URL valid for expiresInSeconds (default 900 = 15 min).
   */
  async getPresignedGetUrl(
    storageKey: string,
    expiresInSeconds = 900,
  ): Promise<string> {
    return this.client.presignedGetObject(
      this.bucket,
      storageKey,
      expiresInSeconds,
    );
  }

  /**
   * Uploads a Buffer directly to MinIO at the given key.
   * Used for server-generated artifacts like ZIP archives.
   */
  async uploadBuffer(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.putObject(
      this.bucket,
      storageKey,
      buffer,
      buffer.length,
      { 'Content-Type': mimeType },
    );
  }

  /**
   * Downloads an object from MinIO and returns it as a Buffer.
   */
  async getObjectBuffer(storageKey: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, storageKey);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Schedules storage object deletion (fire-and-forget, async).
   * Called by soft-delete flow — do not await in controller.
   */
  async scheduleDelete(storageKey: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, storageKey);
    } catch (err) {
      this.logger.warn(`Failed to delete object ${storageKey}: ${err}`);
    }
  }
}
