import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { app } from '../server';
import { User } from '../models/User';
import { Sticker } from '../models/Sticker';
import { StickerPack } from '../models/StickerPack';
import { ENV } from '../config/env';

describe('StickerForge Full API Integration Tests', () => {
  let authToken = '';
  let uploadedImageUrl = '';
  let stickerId = '';
  let packId = '';

  beforeAll(async () => {
    // Connect to test database or local mongo
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }
    // Clean up test data
    await User.deleteMany({ email: /test.*@example\.com/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test.*@example\.com/ });
    if (packId) await StickerPack.findByIdAndDelete(packId);
    if (stickerId) await Sticker.findByIdAndDelete(stickerId);
    await mongoose.disconnect();
  });

  it('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/register creates a new user and returns JWT', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Integration Tester',
      email: 'test_integration@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test_integration@example.com');
    authToken = res.body.data.token;
  });

  it('POST /api/auth/login validates credentials and issues token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_integration@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('GET /api/auth/me returns current user info when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Integration Tester');
  });

  it('POST /api/images/upload uploads and normalizes an image', async () => {
    // Generate a valid 150x150 PNG buffer
    const testBuffer = await sharp({
      create: {
        width: 150,
        height: 150,
        channels: 4,
        background: { r: 120, g: 80, b: 200, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const res = await request(app)
      .post('/api/images/upload')
      .attach('image', testBuffer, 'test_sample.png');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toMatch(/^\/uploads\/originals\//);
    expect(res.body.data.width).toBe(150);
    expect(res.body.data.height).toBe(150);
    uploadedImageUrl = res.body.data.url;
  });

  it('POST /api/stickers/create generates sticker and persists to user account', async () => {
    const res = await request(app)
      .post('/api/stickers/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        originalUrl: uploadedImageUrl,
        name: 'Cool Integration Sticker',
        settings: {
          outline: {
            enabled: true,
            style: 'white',
            color: '#ffffff',
            width: 8,
          },
          text: {
            content: 'TEST',
            fontSize: 28,
            color: '#ffffff',
            bold: true,
            align: 'bottom',
          },
          exportFormat: 'webp',
          targetSize: 512,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stickerUrl).toMatch(/^\/uploads\/stickers\//);
    expect(res.body.data.width).toBe(512);
    expect(res.body.data.height).toBe(512);
    expect(res.body.data.savedToAccount).toBe(true);
    expect(res.body.data.id).toBeDefined();
    stickerId = res.body.data.id;
  });

  it('GET /api/stickers retrieves user library', async () => {
    const res = await request(app)
      .get('/api/stickers')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]._id).toBe(stickerId);
  });

  it('POST /api/packs creates a new sticker pack and adds stickers', async () => {
    const res = await request(app)
      .post('/api/packs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Memes & Reactions',
        description: 'Test pack for stickers',
        stickers: [stickerId],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Memes & Reactions');
    expect(res.body.data.stickers.length).toBe(1);
    packId = res.body.data._id;
  });

  it('GET /api/packs/:id/download streams a valid ZIP archive of the pack', async () => {
    const res = await request(app)
      .get(`/api/packs/${packId}/download`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/zip');
    expect(res.headers['content-disposition']).toMatch(/attachment; filename=.*\.zip/);
    expect(res.body).toBeDefined();
  });
});
