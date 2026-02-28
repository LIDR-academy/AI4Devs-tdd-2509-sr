import { PrismaClient } from '@prisma/client';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';

// ── Mock Prisma ──────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
    const mockCandidate = {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    };
    const mockEducation = {
        create: jest.fn(),
        update: jest.fn(),
    };
    const mockWorkExperience = {
        create: jest.fn(),
        update: jest.fn(),
    };
    const mockResume = {
        create: jest.fn(),
    };
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            candidate: mockCandidate,
            education: mockEducation,
            workExperience: mockWorkExperience,
            resume: mockResume,
        })),
        Prisma: {
            PrismaClientInitializationError: class PrismaClientInitializationError extends Error { },
        },
    };
});

// Helper to get the mocked Prisma instance methods
const getPrisma = () => new PrismaClient() as any;

// ── Candidate Model ──────────────────────────────────────────────────────────
describe('Candidate model', () => {
    beforeEach(() => jest.clearAllMocks());

    const candidateData = {
        firstName: 'Ana',
        lastName: 'Torres',
        email: 'ana.torres@test.com',
        phone: '+525512345678',
        address: 'Av. Insurgentes 100',
    };

    const savedRecord = { id: 10, ...candidateData };

    it('constructor asigna correctamente las propiedades', () => {
        const c = new Candidate(candidateData);
        expect(c.firstName).toBe('Ana');
        expect(c.email).toBe('ana.torres@test.com');
        expect(c.education).toEqual([]);
        expect(c.workExperience).toEqual([]);
        expect(c.resumes).toEqual([]);
    });

    it('save() crea un nuevo candidato cuando no hay id', async () => {
        getPrisma().candidate.create.mockResolvedValue(savedRecord);
        const c = new Candidate(candidateData);
        const result = await c.save();
        expect(result).toEqual(savedRecord);
        expect(getPrisma().candidate.create).toHaveBeenCalledTimes(1);
    });

    it('save() actualiza el candidato cuando hay id', async () => {
        const updated = { ...savedRecord, firstName: 'Ana María' };
        getPrisma().candidate.update.mockResolvedValue(updated);
        const c = new Candidate({ ...candidateData, id: 10 });
        const result = await c.save();
        expect(result).toEqual(updated);
        expect(getPrisma().candidate.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 10 } })
        );
    });

    it('findOne() retorna un Candidate cuando existe el registro', async () => {
        getPrisma().candidate.findUnique.mockResolvedValue(savedRecord);
        const c = await Candidate.findOne(10);
        expect(c).toBeInstanceOf(Candidate);
        expect(c?.email).toBe('ana.torres@test.com');
    });

    it('findOne() retorna null cuando el candidato no existe', async () => {
        getPrisma().candidate.findUnique.mockResolvedValue(null);
        const c = await Candidate.findOne(999);
        expect(c).toBeNull();
    });

    it('save() propaga errores genéricos de base de datos sin modificarlos', async () => {
        const dbError = new Error('DB timeout');
        getPrisma().candidate.create.mockRejectedValue(dbError);
        const c = new Candidate(candidateData);
        await expect(c.save()).rejects.toThrow('DB timeout');
    });
});

// ── Education Model ──────────────────────────────────────────────────────────
describe('Education model', () => {
    beforeEach(() => jest.clearAllMocks());

    const educationData = {
        institution: 'UNAM',
        title: 'Ingeniería en Sistemas',
        startDate: '2015-01-01',
        endDate: '2019-12-31',
        candidateId: 10,
    };

    it('constructor asigna correctamente las propiedades', () => {
        const e = new Education(educationData);
        expect(e.institution).toBe('UNAM');
        expect(e.startDate).toBeInstanceOf(Date);
        expect(e.endDate).toBeInstanceOf(Date);
        expect(e.candidateId).toBe(10);
    });

    it('save() crea un nuevo registro cuando no hay id', async () => {
        const saved = { id: 1, ...educationData };
        getPrisma().education.create.mockResolvedValue(saved);
        const e = new Education(educationData);
        const result = await e.save();
        expect(result).toEqual(saved);
        expect(getPrisma().education.create).toHaveBeenCalledTimes(1);
    });

    it('save() actualiza el registro cuando hay id', async () => {
        const updated = { id: 1, ...educationData, title: 'Maestría' };
        getPrisma().education.update.mockResolvedValue(updated);
        const e = new Education({ ...educationData, id: 1 });
        const result = await e.save();
        expect(result).toEqual(updated);
        expect(getPrisma().education.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 1 } })
        );
    });

    it('endDate es undefined cuando no se proporciona', () => {
        const e = new Education({ ...educationData, endDate: undefined });
        expect(e.endDate).toBeUndefined();
    });
});

// ── WorkExperience Model ─────────────────────────────────────────────────────
describe('WorkExperience model', () => {
    beforeEach(() => jest.clearAllMocks());

    const experienceData = {
        company: 'TechCorp',
        position: 'Software Engineer',
        description: 'Desarrollo backend',
        startDate: '2020-01-01',
        endDate: '2023-06-30',
        candidateId: 10,
    };

    it('constructor asigna correctamente las propiedades', () => {
        const w = new WorkExperience(experienceData);
        expect(w.company).toBe('TechCorp');
        expect(w.position).toBe('Software Engineer');
        expect(w.startDate).toBeInstanceOf(Date);
    });

    it('save() crea un nuevo registro cuando no hay id', async () => {
        const saved = { id: 5, ...experienceData };
        getPrisma().workExperience.create.mockResolvedValue(saved);
        const w = new WorkExperience(experienceData);
        const result = await w.save();
        expect(result).toEqual(saved);
    });

    it('save() actualiza el registro cuando hay id', async () => {
        const updated = { id: 5, ...experienceData, position: 'Senior SWE' };
        getPrisma().workExperience.update.mockResolvedValue(updated);
        const w = new WorkExperience({ ...experienceData, id: 5 });
        const result = await w.save();
        expect(result).toEqual(updated);
        expect(getPrisma().workExperience.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 5 } })
        );
    });
});

// ── Resume Model ─────────────────────────────────────────────────────────────
describe('Resume model', () => {
    beforeEach(() => jest.clearAllMocks());

    const resumeData = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 10,
    };

    it('constructor asigna correctamente las propiedades', () => {
        const r = new Resume(resumeData);
        expect(r.filePath).toBe('uploads/cv.pdf');
        expect(r.fileType).toBe('application/pdf');
        expect(r.uploadDate).toBeInstanceOf(Date);
    });

    it('save() crea un nuevo CV cuando no hay id', async () => {
        const saved = { id: 3, ...resumeData, uploadDate: new Date() };
        getPrisma().resume.create.mockResolvedValue(saved);
        const r = new Resume(resumeData);
        const result = await r.save();
        expect(result).toBeInstanceOf(Resume);
        expect(getPrisma().resume.create).toHaveBeenCalledTimes(1);
    });

    it('save() lanza error si se intenta actualizar un CV existente', async () => {
        const r = new Resume({ ...resumeData, id: 3 });
        await expect(r.save()).rejects.toThrow('No se permite la actualización de un currículum existente.');
    });
});
