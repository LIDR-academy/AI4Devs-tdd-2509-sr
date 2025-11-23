process.env.NODE_ENV = 'test';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';

// Real Prisma (sin mocks) para pruebas de aceptación
const prisma = new PrismaClient();

// Ensure all potential uploads directories exist for multer storage
// Multer destination is '../uploads/' relative to process.cwd() (likely backend/)
const uploadsDirSrc = path.resolve(__dirname, '../uploads'); // backend/src/uploads
const uploadsDirBackend = path.resolve(__dirname, '../../uploads'); // backend/uploads
const uploadsDirRoot = path.resolve(__dirname, '../../../uploads'); // project-root/uploads
[uploadsDirSrc, uploadsDirBackend, uploadsDirRoot].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

describe('API Acceptance Tests', () => {
  describe('GET /', () => {
    it('should return greeting message (happy path)', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Hola LTI');
    });
  });

  describe('POST /candidates', () => {
    const validCandidate = {
      firstName: 'Juan',
      lastName: 'García',
      email: 'juan.garcia@example.com',
    };

    it('should create candidate (happy path)', async () => {
      // Usar email único para evitar violar constraint UNIQUE
      const uniqueEmail = `juan.garcia+${Date.now()}@example.com`;
      const payload = { ...validCandidate, email: uniqueEmail };
      const res = await request(app).post('/candidates').send(payload);
      expect(res.status).toBe(201);
      // Respuesta del route devuelve el candidato directamente (candidateRoutes.ts)
      expect(res.body).toMatchObject({
        firstName: payload.firstName,
        email: payload.email,
      });
      expect(res.body).toHaveProperty('id');
      // Limpieza: borrar el candidato creado
      await prisma.candidate.delete({ where: { id: res.body.id } });
    });

    it('should return validation error (corner case invalid email)', async () => {
      const invalidCandidate = { ...validCandidate, email: 'bad-email' };
      // We do NOT need to set prisma mock because validation fails before DB call
      const res = await request(app).post('/candidates').send(invalidCandidate);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Invalid email');
    });
  });

  describe('POST /upload', () => {
    const pdfPath = path.resolve(__dirname, 'fixtures', 'sample.pdf');
    const txtPath = path.resolve(__dirname, 'fixtures', 'sample.txt');

    it('should accept a PDF file (happy path)', async () => {
      const res = await request(app).post('/upload').attach('file', pdfPath);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('filePath');
      expect(res.body).toHaveProperty('fileType');
      expect(res.body.fileType).toBe('application/pdf');
      // No cleanup (archivo temporal). Podría añadirse fs.unlinkSync si se desea.
    });

    it('should reject an invalid file type (corner case)', async () => {
      const res = await request(app).post('/upload').attach('file', txtPath);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Invalid file type');
    });
  });
});
