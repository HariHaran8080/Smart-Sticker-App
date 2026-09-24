import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/env';
/**
 * Local File Storage Service
 *
 * NOTE: Local file storage is retained for portfolio and demo deployments.
 * On ephemeral container platforms (such as Render free tier instances), local storage
 * functions directly during the active container session. For persistent multi-instance
 * production environments in the future, cloud object storage (e.g., AWS S3 or Cloudflare R2)
 * should be used.
 */

export interface StorageResult {
  filename: string;
  filePath: string;
  publicUrl: string;
}

export class StorageService {
  private baseDir: string;
  private originalsDir: string;
  private processedDir: string;
  private stickersDir: string;

  constructor() {
    this.baseDir = ENV.UPLOAD_DIR;
    this.originalsDir = path.join(this.baseDir, 'originals');
    this.processedDir = path.join(this.baseDir, 'processed');
    this.stickersDir = path.join(this.baseDir, 'stickers');
    this.initDirs();
  }

  private async initDirs() {
    await fs.mkdir(this.originalsDir, { recursive: true });
    await fs.mkdir(this.processedDir, { recursive: true });
    await fs.mkdir(this.stickersDir, { recursive: true });
  }

  /**
   * Save a buffer or file to the specified category ('originals' | 'processed' | 'stickers')
   */
  async saveFile(
    buffer: Buffer,
    category: 'originals' | 'processed' | 'stickers',
    ext: string
  ): Promise<StorageResult> {
    await this.initDirs();
    const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
    const filename = `${uuidv4()}${cleanExt}`;
    const targetDir =
      category === 'originals'
        ? this.originalsDir
        : category === 'processed'
        ? this.processedDir
        : this.stickersDir;

    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${category}/${filename}`;
    return { filename, filePath, publicUrl };
  }

  /**
   * Resolve an uploaded relative URL (e.g. /uploads/originals/xyz.png) to an absolute filesystem path
   */
  resolvePath(publicUrlOrPath: string): string {
    if (publicUrlOrPath.startsWith(this.baseDir)) {
      return publicUrlOrPath;
    }

    const normalized = publicUrlOrPath.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads/') || normalized.startsWith('uploads/')) {
      const cleanRel = normalized.replace(/^\/?uploads\//, '');
      return path.join(this.baseDir, cleanRel);
    }

    if (path.isAbsolute(publicUrlOrPath)) {
      if (process.platform === 'win32' && /^[/\\](?![\/\\])/.test(publicUrlOrPath)) {
        const cleanRel = publicUrlOrPath.replace(/^[/\\]+/, '');
        return path.join(this.baseDir, cleanRel);
      }
      return publicUrlOrPath;
    }

    const cleanRel = publicUrlOrPath.replace(/^\/?uploads[/\\]/, '');
    return path.join(this.baseDir, cleanRel);
  }

  /**
   * Read file buffer from a public URL or path
   */
  async readFile(publicUrlOrPath: string): Promise<Buffer> {
    const absPath = this.resolvePath(publicUrlOrPath);
    return fs.readFile(absPath);
  }

  /**
   * Delete a file if it exists
   */
  async deleteFile(publicUrlOrPath: string): Promise<void> {
    try {
      const absPath = this.resolvePath(publicUrlOrPath);
      await fs.unlink(absPath);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

export const storageService = new StorageService();
