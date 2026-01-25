import { addCandidate } from '../application/services/candidateService';

// Define the mock factory
jest.mock('@prisma/client', () => {
  const mPrisma = {
    candidate: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    education: {
      create: jest.fn(),
      update: jest.fn(),
    },
    workExperience: {
      create: jest.fn(),
      update: jest.fn(),
    },
    resume: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrisma),
    Prisma: {
      PrismaClientInitializationError: class extends Error {},
    },
    __mockInstance: mPrisma, // Expose the mock instance
  };
});

// Import the mocked module to access the exposed instance
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __mockInstance } = require('@prisma/client');

describe('Candidate Service - addCandidate', () => {
  const mockPrisma = __mockInstance;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Validaciones
  describe('Validación de entrada', () => {
    it('debería lanzar un error si falta el nombre (firstName)', async () => {
      const invalidData = {
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debería lanzar un error si el email es inválido', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      };
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('debería lanzar un error si el teléfono tiene formato incorrecto', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '12345', // Formato incorrecto
      };
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid phone');
    });
  });

  // Persistencia (Happy Path)
  describe('Persistencia (Happy Path)', () => {
    it('debería guardar el candidato y sus relaciones correctamente con datos válidos', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: '123 Main St',
        educations: [
          {
            institution: 'University X',
            title: 'BSc CS',
            startDate: '2010-01-01',
            endDate: '2014-01-01',
          },
        ],
      };

      // Mock del retorno de prisma.candidate.create
      const mockCreatedCandidate = {
        id: 1,
        ...validData,
        education: [],
        workExperience: [],
        resumes: [],
      };

      mockPrisma.candidate.create.mockResolvedValue(mockCreatedCandidate);
      mockPrisma.education.create.mockResolvedValue({
        id: 101,
        ...validData.educations[0],
        candidateId: 1,
      });

      const result = await addCandidate(validData);

      // Verificaciones
      expect(result).toBeDefined();
      expect(result.id).toBe(1);

      // Verificar que se llamó a crear candidato
      expect(mockPrisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          }),
        })
      );

      // Verificar que se llamó a crear educación
      expect(mockPrisma.education.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.education.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            institution: 'University X',
            candidateId: 1,
          }),
        })
      );
    });
  });
});
