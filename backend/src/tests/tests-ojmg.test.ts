import { addCandidate } from '../application/services/candidateService';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        candidate: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
        education: {
            create: jest.fn(),
        },
        workExperience: {
            create: jest.fn(),
        },
        resume: {
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
        Prisma: {
            PrismaClientInitializationError: jest.fn(),
        }
    };
});

describe('US-01: Register Candidate', () => {
    let prisma: any;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        prisma = new PrismaClient();
    });

    it('should register a new candidate successfully with all fields', async () => {
        const candidateData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '600000000',
            address: '123 Main St',
            educations: [
                {
                    institution: 'University',
                    title: 'Degree',
                    startDate: '2020-01-01',
                    endDate: '2024-01-01',
                },
            ],
            workExperiences: [
                {
                    company: 'Tech Corp',
                    position: 'Developer',
                    description: 'Coding',
                    startDate: '2024-02-01',
                    endDate: '2025-01-01',
                },
            ],
            cv: {
                filePath: '/uploads/cv.pdf',
                fileType: 'application/pdf',
            },
        };

        const savedCandidate = { ...candidateData, id: 1 };
        prisma.candidate.create.mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(prisma.candidate.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedCandidate);
    });

    it('should throw an error if required fields are missing', async () => {
        const candidateData = {
            firstName: 'John',
            // lastName missing
            email: 'john.doe@example.com',
        };

        await expect(addCandidate(candidateData)).rejects.toThrow();
    });

    it('should throw an error if email format is invalid', async () => {
        const candidateData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid-email',
        };

        await expect(addCandidate(candidateData)).rejects.toThrow();
    });

    it('should throw an error if email already exists', async () => {
        const candidateData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'existing@example.com',
        };

        const error = new Error('Unique constraint failed');
        (error as any).code = 'P2002';
        prisma.candidate.create.mockRejectedValue(error);

        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });
});
