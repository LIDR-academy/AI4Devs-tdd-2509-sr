import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { PrismaClient, Prisma } from '@prisma/client';

// Mock del Prisma Client
const mockPrismaClient = {
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
  },
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      PrismaClientInitializationError: class extends Error {
        constructor(message: string, clientVersion?: string, errorCode?: string) {
          super(message);
          this.name = 'PrismaClientInitializationError';
        }
      },
    },
  };
});

// Mock de los modelos - simplificado para evitar problemas de TypeScript
jest.mock('../domain/models/Candidate', () => {
  const actual = jest.requireActual('../domain/models/Candidate');
  return {
    ...actual,
    Candidate: jest.fn().mockImplementation((data: any) => {
      const instance = new actual.Candidate(data);
      instance.save = jest.fn().mockImplementation(async () => {
        const prisma = new PrismaClient();
        return await prisma.candidate.create({
          data: {
            firstName: instance.firstName,
            lastName: instance.lastName,
            email: instance.email,
            phone: instance.phone,
            address: instance.address,
          }
        });
      });
      return instance;
    }),
  };
});

jest.mock('../domain/models/Education', () => {
  const actual = jest.requireActual('../domain/models/Education');
  return {
    ...actual,
    Education: jest.fn().mockImplementation((data: any) => {
      const instance = new actual.Education(data);
      instance.save = jest.fn().mockImplementation(async () => {
        const prisma = new PrismaClient();
        return await prisma.education.create({
          data: {
            institution: instance.institution,
            title: instance.title,
            startDate: instance.startDate,
            endDate: instance.endDate,
            candidateId: instance.candidateId,
          }
        });
      });
      return instance;
    }),
  };
});

jest.mock('../domain/models/WorkExperience', () => {
  const actual = jest.requireActual('../domain/models/WorkExperience');
  return {
    ...actual,
    WorkExperience: jest.fn().mockImplementation((data: any) => {
      const instance = new actual.WorkExperience(data);
      instance.save = jest.fn().mockImplementation(async () => {
        const prisma = new PrismaClient();
        return await prisma.workExperience.create({
          data: {
            company: instance.company,
            position: instance.position,
            description: instance.description,
            startDate: instance.startDate,
            endDate: instance.endDate,
            candidateId: instance.candidateId,
          }
        });
      });
      return instance;
    }),
  };
});

jest.mock('../domain/models/Resume', () => {
  const actual = jest.requireActual('../domain/models/Resume');
  return {
    ...actual,
    Resume: jest.fn().mockImplementation((data: any) => {
      const instance = new actual.Resume(data);
      instance.save = jest.fn().mockImplementation(async () => {
        const prisma = new PrismaClient();
        const createdResume = await prisma.resume.create({
          data: {
            candidateId: instance.candidateId,
            filePath: instance.filePath,
            fileType: instance.fileType,
            uploadDate: instance.uploadDate
          },
        });
        return new actual.Resume(createdResume);
      });
      return instance;
    }),
  };
});

// Helper para crear datos de test válidos
const createValidCandidateData = () => ({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '612345678',
  address: 'Calle Principal 123',
  educations: [
    {
      institution: 'Universidad Test',
      title: 'Ingeniería Informática',
      startDate: '2010-09-01',
      endDate: '2014-06-30'
    }
  ],
  workExperiences: [
    {
      company: 'Empresa Test',
      position: 'Desarrollador',
      description: 'Desarrollo de aplicaciones',
      startDate: '2015-01-01',
      endDate: '2020-12-31'
    }
  ],
  cv: {
    filePath: 'uploads/test-cv.pdf',
    fileType: 'application/pdf'
  }
});

describe('Suite de Tests Unitarios - Inserción de Candidatos', () => {
  beforeEach(() => {
    // Resetear todos los mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // FAMILIA 1: VALIDACIÓN DE DATOS DEL FORMULARIO
  // ============================================

  describe('Familia 1: Validación de Datos del Formulario', () => {
    describe('Validación Exitosa', () => {
      it('should validate candidate data with all valid fields', () => {
        // Arrange
        const candidateData = createValidCandidateData();

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should validate candidate data with optional fields missing', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should validate candidate data with educations', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: 'Universidad Test',
              title: 'Ingeniería Informática',
              startDate: '2010-09-01',
              endDate: '2014-06-30'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should validate candidate data with workExperiences', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: 'Empresa Test',
              position: 'Desarrollador',
              description: 'Desarrollo de aplicaciones',
              startDate: '2015-01-01',
              endDate: '2020-12-31'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should validate candidate data with CV', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          cv: {
            filePath: 'uploads/test-cv.pdf',
            fileType: 'application/pdf'
          }
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should skip validation when id is provided (editing mode)', () => {
        // Arrange
        const candidateData = {
          id: 1,
          firstName: '', // Campo inválido, pero debe ser ignorado
          email: 'invalid-email' // Email inválido, pero debe ser ignorado
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });
    });

    describe('Validación de Campos Individuales - firstName', () => {
      it('should throw error for empty firstName', () => {
        // Arrange
        const candidateData = {
          firstName: '',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for firstName too short', () => {
        // Arrange
        const candidateData = {
          firstName: 'A',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for firstName too long', () => {
        // Arrange
        const candidateData = {
          firstName: 'A'.repeat(101),
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for firstName with invalid characters', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan123',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for undefined firstName', () => {
        // Arrange
        const candidateData = {
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });
    });

    describe('Validación de Campos Individuales - lastName', () => {
      it('should throw error for empty lastName', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: '',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for lastName too short', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'P',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for lastName too long', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'P'.repeat(101),
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });

      it('should throw error for lastName with invalid characters', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez123',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
      });
    });

    describe('Validación de Campos Individuales - email', () => {
      it('should throw error for empty email', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: ''
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
      });

      it('should throw error for invalid email format - missing @', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perezexample.com'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
      });

      it('should throw error for invalid email format - missing domain', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
      });

      it('should throw error for invalid email format - missing TLD', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
      });
    });

    describe('Validación de Campos Individuales - phone', () => {
      it('should throw error for invalid phone format - wrong length', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '12345678'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
      });

      it('should throw error for invalid phone format - does not start with 6, 7 or 9', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '512345678'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
      });

      it('should validate phone starting with 6', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '612345678'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should validate phone starting with 7', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '712345678'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });

      it('should validate phone starting with 9', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '912345678'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });
    });

    describe('Validación de Campos Individuales - address', () => {
      it('should throw error for address too long', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          address: 'A'.repeat(101)
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid address');
      });

      it('should validate address with valid length', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          address: 'Calle Principal 123'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).not.toThrow();
      });
    });

    describe('Validación de Campos Individuales - education', () => {
      it('should throw error for invalid institution - empty', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: '',
              title: 'Ingeniería Informática',
              startDate: '2010-09-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
      });

      it('should throw error for invalid institution - too long', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: 'A'.repeat(101),
              title: 'Ingeniería Informática',
              startDate: '2010-09-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
      });

      it('should throw error for invalid title - empty', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: 'Universidad Test',
              title: '',
              startDate: '2010-09-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid title');
      });

      it('should throw error for invalid startDate', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: 'Universidad Test',
              title: 'Ingeniería Informática',
              startDate: '01-09-2010'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
      });

      it('should throw error for invalid endDate format', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: 'Universidad Test',
              title: 'Ingeniería Informática',
              startDate: '2010-09-01',
              endDate: '30-06-2014'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid end date');
      });
    });

    describe('Validación de Campos Individuales - workExperience', () => {
      it('should throw error for invalid company - empty', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: '',
              position: 'Desarrollador',
              startDate: '2015-01-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid company');
      });

      it('should throw error for invalid company - too long', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: 'A'.repeat(101),
              position: 'Desarrollador',
              startDate: '2015-01-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid company');
      });

      it('should throw error for invalid position - empty', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: 'Empresa Test',
              position: '',
              startDate: '2015-01-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid position');
      });

      it('should throw error for invalid description - too long', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: 'Empresa Test',
              position: 'Desarrollador',
              description: 'A'.repeat(201),
              startDate: '2015-01-01'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid description');
      });

      it('should throw error for invalid startDate', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: 'Empresa Test',
              position: 'Desarrollador',
              startDate: '01-01-2015'
            }
          ]
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
      });
    });

    describe('Validación de Campos Individuales - CV', () => {
      it('should throw error for invalid CV - not an object', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          cv: 'invalid-cv'
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
      });

      it('should throw error for invalid CV - missing filePath', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          cv: {
            fileType: 'application/pdf'
          }
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
      });

      it('should throw error for invalid CV - missing fileType', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          cv: {
            filePath: 'uploads/test-cv.pdf'
          }
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
      });

      it('should throw error for invalid CV - filePath not a string', () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          cv: {
            filePath: 123,
            fileType: 'application/pdf'
          }
        };

        // Act & Assert
        expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
      });
    });
  });

  // ============================================
  // FAMILIA 2: GUARDADO EN LA BASE DE DATOS
  // ============================================

  describe('Familia 2: Guardado en la Base de Datos', () => {
    describe('Guardado Exitoso', () => {
      it('should save candidate successfully with minimal data', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        const mockSavedCandidate = {
          id: 1,
          ...candidateData,
          phone: null,
          address: null
        };

        mockPrismaClient.candidate.create.mockResolvedValue(mockSavedCandidate);

        // Act
        const result = await addCandidate(candidateData);

        // Assert
        expect(result).toEqual(mockSavedCandidate);
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
      });

      it('should save candidate with educations', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          educations: [
            {
              institution: 'Universidad Test',
              title: 'Ingeniería Informática',
              startDate: '2010-09-01',
              endDate: '2014-06-30'
            }
          ]
        };

        const mockSavedCandidate = {
          id: 1,
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          phone: null,
          address: null
        };

        const mockSavedEducation = {
          id: 1,
          candidateId: 1,
          ...candidateData.educations[0],
          startDate: new Date(candidateData.educations[0].startDate),
          endDate: new Date(candidateData.educations[0].endDate)
        };

        mockPrismaClient.candidate.create.mockResolvedValue(mockSavedCandidate);
        mockPrismaClient.education.create.mockResolvedValue(mockSavedEducation);

        // Act
        const result = await addCandidate(candidateData);

        // Assert
        expect(result).toEqual(mockSavedCandidate);
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
        expect(mockPrismaClient.education.create).toHaveBeenCalledTimes(1);
      });

      it('should save candidate with workExperiences', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          workExperiences: [
            {
              company: 'Empresa Test',
              position: 'Desarrollador',
              description: 'Desarrollo de aplicaciones',
              startDate: '2015-01-01',
              endDate: '2020-12-31'
            }
          ]
        };

        const mockSavedCandidate = {
          id: 1,
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          phone: null,
          address: null
        };

        const mockSavedWorkExperience = {
          id: 1,
          candidateId: 1,
          ...candidateData.workExperiences[0],
          startDate: new Date(candidateData.workExperiences[0].startDate),
          endDate: new Date(candidateData.workExperiences[0].endDate)
        };

        mockPrismaClient.candidate.create.mockResolvedValue(mockSavedCandidate);
        mockPrismaClient.workExperience.create.mockResolvedValue(mockSavedWorkExperience);

        // Act
        const result = await addCandidate(candidateData);

        // Assert
        expect(result).toEqual(mockSavedCandidate);
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
        expect(mockPrismaClient.workExperience.create).toHaveBeenCalledTimes(1);
      });

      it('should save candidate with CV', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          cv: {
            filePath: 'uploads/test-cv.pdf',
            fileType: 'application/pdf'
          }
        };

        const mockSavedCandidate = {
          id: 1,
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          phone: null,
          address: null
        };

        const mockSavedResume = {
          id: 1,
          candidateId: 1,
          filePath: candidateData.cv.filePath,
          fileType: candidateData.cv.fileType,
          uploadDate: new Date()
        };

        mockPrismaClient.candidate.create.mockResolvedValue(mockSavedCandidate);
        mockPrismaClient.resume.create.mockResolvedValue(mockSavedResume);

        // Act
        const result = await addCandidate(candidateData);

        // Assert
        expect(result).toEqual(mockSavedCandidate);
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
        expect(mockPrismaClient.resume.create).toHaveBeenCalledTimes(1);
      });

      it('should save candidate with all related data', async () => {
        // Arrange
        const candidateData = createValidCandidateData();

        const mockSavedCandidate = {
          id: 1,
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          phone: candidateData.phone,
          address: candidateData.address
        };

        const mockSavedEducation = {
          id: 1,
          candidateId: 1,
          ...candidateData.educations[0],
          startDate: new Date(candidateData.educations[0].startDate),
          endDate: new Date(candidateData.educations[0].endDate)
        };

        const mockSavedWorkExperience = {
          id: 1,
          candidateId: 1,
          ...candidateData.workExperiences[0],
          startDate: new Date(candidateData.workExperiences[0].startDate),
          endDate: new Date(candidateData.workExperiences[0].endDate)
        };

        const mockSavedResume = {
          id: 1,
          candidateId: 1,
          filePath: candidateData.cv.filePath,
          fileType: candidateData.cv.fileType,
          uploadDate: new Date()
        };

        mockPrismaClient.candidate.create.mockResolvedValue(mockSavedCandidate);
        mockPrismaClient.education.create.mockResolvedValue(mockSavedEducation);
        mockPrismaClient.workExperience.create.mockResolvedValue(mockSavedWorkExperience);
        mockPrismaClient.resume.create.mockResolvedValue(mockSavedResume);

        // Act
        const result = await addCandidate(candidateData);

        // Assert
        expect(result).toEqual(mockSavedCandidate);
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
        expect(mockPrismaClient.education.create).toHaveBeenCalledTimes(1);
        expect(mockPrismaClient.workExperience.create).toHaveBeenCalledTimes(1);
        expect(mockPrismaClient.resume.create).toHaveBeenCalledTimes(1);
      });
    });

    describe('Tests de Errores', () => {
      it('should throw error when email already exists (P2002)', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        const prismaError = {
          code: 'P2002',
          meta: {
            target: ['email']
          }
        };

        mockPrismaClient.candidate.create.mockRejectedValue(prismaError);

        // Act & Assert
        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
      });

      it('should throw error when validation fails before saving', async () => {
        // Arrange
        const candidateData = {
          firstName: '', // Inválido
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        // Act & Assert
        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid name');
        expect(mockPrismaClient.candidate.create).not.toHaveBeenCalled();
      });

      it('should throw error when database connection fails', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        const connectionError = new Prisma.PrismaClientInitializationError(
          'No se pudo conectar con la base de datos',
          '5.0.0'
        );

        mockPrismaClient.candidate.create.mockRejectedValue(connectionError);

        // Act & Assert
        await expect(addCandidate(candidateData)).rejects.toThrow();
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
      });

      it('should propagate other database errors', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com'
        };

        const genericError = new Error('Database error');

        mockPrismaClient.candidate.create.mockRejectedValue(genericError);

        // Act & Assert
        await expect(addCandidate(candidateData)).rejects.toThrow('Database error');
        expect(mockPrismaClient.candidate.create).toHaveBeenCalledTimes(1);
      });
    });
  });
});
