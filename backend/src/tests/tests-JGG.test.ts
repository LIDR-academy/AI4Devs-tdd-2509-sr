import { addCandidate } from '../application/services/candidateService';
import { PrismaClient } from '@prisma/client';

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  // Ahora sólo necesitamos mockear candidate.* porque las relaciones
  // se manejan mediante nested writes dentro de candidate.create/update
  const mockPrismaClient = {
    candidate: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'PrismaClientInitializationError';
        }
      },
    },
  };
});

// Obtener la instancia mockeada de Prisma
const mockPrisma = new PrismaClient() as any;

describe('addCandidate - Unit Tests', () => {
  // Mock de datos válidos para tests
  const validCandidateData = {
    firstName: 'Juan',
    lastName: 'García',
    email: 'juan.garcia@example.com',
    phone: '612345678',
    address: 'Calle Mayor 123',
  };

  const validEducationData = {
    institution: 'Universidad Complutense',
    title: 'Ingeniería Informática',
    startDate: '2015-09-01',
    endDate: '2019-06-30',
  };

  const validExperienceData = {
    company: 'Tech Solutions SA',
    position: 'Desarrollador Senior',
    description: 'Desarrollo de aplicaciones web',
    startDate: '2019-07-01',
    endDate: '2023-12-31',
  };

  const validCVData = {
    filePath: '/uploads/cv.pdf',
    fileType: 'application/pdf',
  };

  // Limpiar mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Caso feliz - Inserción exitosa', () => {
    it('debe insertar un candidato correctamente con todos los campos obligatorios', async () => {
      // Arrange
      const mockSavedCandidate = { id: 1, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(validCandidateData);

      // Assert
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: validCandidateData.firstName,
          lastName: validCandidateData.lastName,
          email: validCandidateData.email,
          phone: validCandidateData.phone,
          address: validCandidateData.address,
        }),
      });
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con educación (nested write)', async () => {
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [validEducationData],
      };
      const mockSavedCandidate = { id: 2, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateWithEducation);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          educations: {
            create: [
              expect.objectContaining({
                institution: validEducationData.institution,
                title: validEducationData.title,
                startDate: expect.any(Date),
                endDate: expect.any(Date),
              }),
            ],
          },
        }),
      });
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con experiencia laboral (nested write)', async () => {
      const candidateWithExperience = {
        ...validCandidateData,
        workExperiences: [validExperienceData],
      };
      const mockSavedCandidate = { id: 3, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateWithExperience);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workExperiences: {
            create: [
              expect.objectContaining({
                company: validExperienceData.company,
                position: validExperienceData.position,
                description: validExperienceData.description,
                startDate: expect.any(Date),
                endDate: expect.any(Date),
              }),
            ],
          },
        }),
      });
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con resume (nested write)', async () => {
      // Para que el nested write funcione usamos la propiedad "resumes" (no "cv")
      const candidateWithResume = {
        ...validCandidateData,
        resumes: [validCVData],
      };
      const mockSavedCandidate = { id: 4, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateWithResume);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          resumes: {
            create: [
              expect.objectContaining({
                filePath: validCVData.filePath,
                fileType: validCVData.fileType,
              }),
            ],
          },
        }),
      });
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe transformar un cv único en resumes (normalización)', async () => {
      const candidateWithSingleCv = {
        ...validCandidateData,
        cv: validCVData,
      };
      const mockSavedCandidate = { id: 40, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateWithSingleCv);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          resumes: {
            create: [
              expect.objectContaining({
                filePath: validCVData.filePath,
                fileType: validCVData.fileType,
              }),
            ],
          },
        }),
      });
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato completo con educación, experiencia y resumes (nested write)', async () => {
      const completeCandidateData = {
        ...validCandidateData,
        educations: [validEducationData],
        workExperiences: [validExperienceData],
        resumes: [validCVData],
      };
      const mockSavedCandidate = { id: 5, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      await addCandidate(completeCandidateData);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          educations: expect.objectContaining({ create: expect.any(Array) }),
          workExperiences: expect.objectContaining({
            create: expect.any(Array),
          }),
          resumes: expect.objectContaining({ create: expect.any(Array) }),
        }),
      });
    });

    it('debe insertar un candidato con múltiples registros de educación (nested write)', async () => {
      const education2 = {
        institution: 'EOI Escuela de Organización Industrial',
        title: 'Master en Big Data',
        startDate: '2020-01-15',
        endDate: '2021-06-30',
      };
      const candidateWithMultipleEducation = {
        ...validCandidateData,
        educations: [validEducationData, education2],
      };
      const mockSavedCandidate = { id: 6, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      await addCandidate(candidateWithMultipleEducation);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          educations: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                institution: validEducationData.institution,
              }),
              expect.objectContaining({ institution: education2.institution }),
            ]),
          }),
        }),
      });
    });

    it('debe insertar un candidato con múltiples experiencias laborales (nested write)', async () => {
      const experience2 = {
        company: 'Innovate Corp',
        position: 'Tech Lead',
        description: 'Liderazgo técnico',
        startDate: '2024-01-01',
      };
      const candidateWithMultipleExperience = {
        ...validCandidateData,
        workExperiences: [validExperienceData, experience2],
      };
      const mockSavedCandidate = { id: 7, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      await addCandidate(candidateWithMultipleExperience);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workExperiences: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ company: validExperienceData.company }),
              expect.objectContaining({ company: experience2.company }),
            ]),
          }),
        }),
      });
    });
  });

  describe('Errores de validación', () => {
    it('debe lanzar error si firstName está vacío', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, firstName: '' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si firstName contiene números', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, firstName: 'Juan123' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si firstName es muy corto', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, firstName: 'J' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si firstName es muy largo', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, firstName: 'A'.repeat(101) };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si lastName está vacío', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, lastName: '' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si el email no es válido', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, email: 'email-invalido' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('debe lanzar error si el email no tiene dominio', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, email: 'usuario@' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('debe lanzar error si el teléfono no sigue el formato español', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, phone: '512345678' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid phone');
    });

    it('debe lanzar error si el teléfono tiene menos de 9 dígitos', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, phone: '61234567' };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid phone');
    });

    it('debe lanzar error si la dirección excede el límite de 100 caracteres', async () => {
      // Arrange
      const invalidData = {
        ...validCandidateData,
        address: 'A'.repeat(101),
      };

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow(
        'Invalid address',
      );
    });

    it('debe lanzar error si la institución educativa está vacía', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, institution: '' }],
      };

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid institution',
      );
    });

    it('debe lanzar error si la institución educativa es muy larga', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, institution: 'A'.repeat(101) }],
      };

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid institution',
      );
    });

    it('debe lanzar error si el título de educación está vacío', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, title: '' }],
      };

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid title',
      );
    });

    it('debe lanzar error si la fecha de inicio de educación no es válida', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, startDate: '2015/09/01' }],
      };

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid date',
      );
    });

    it('debe lanzar error si la fecha de fin de educación no es válida', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, endDate: 'invalid-date' }],
      };

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid end date',
      );
    });

    it('debe lanzar error si la empresa está vacía', async () => {
      // Arrange
      const invalidExperience = {
        ...validCandidateData,
        workExperiences: [{ ...validExperienceData, company: '' }],
      };

      // Act & Assert
      await expect(addCandidate(invalidExperience)).rejects.toThrow(
        'Invalid company',
      );
    });

    it('debe lanzar error si la posición está vacía', async () => {
      // Arrange
      const invalidExperience = {
        ...validCandidateData,
        workExperiences: [{ ...validExperienceData, position: '' }],
      };

      // Act & Assert
      await expect(addCandidate(invalidExperience)).rejects.toThrow(
        'Invalid position',
      );
    });

    it('debe lanzar error si la descripción de experiencia excede el límite', async () => {
      // Arrange
      const invalidExperience = {
        ...validCandidateData,
        workExperiences: [
          {
            ...validExperienceData,
            description: 'A'.repeat(201),
          },
        ],
      };

      // Act & Assert
      await expect(addCandidate(invalidExperience)).rejects.toThrow(
        'Invalid description',
      );
    });

    it('debe lanzar error si el CV no tiene filePath', async () => {
      // Arrange
      const invalidCV = {
        ...validCandidateData,
        cv: { fileType: 'application/pdf' },
      };

      // Act & Assert
      await expect(addCandidate(invalidCV)).rejects.toThrow('Invalid CV data');
    });

    it('debe lanzar error si el CV no tiene fileType', async () => {
      // Arrange
      const invalidCV = {
        ...validCandidateData,
        cv: { filePath: '/uploads/cv.pdf' },
      };

      // Act & Assert
      await expect(addCandidate(invalidCV)).rejects.toThrow('Invalid CV data');
    });

    it('debe lanzar error si un resume en el array es inválido', async () => {
      const invalidResumesArray = {
        ...validCandidateData,
        resumes: [{ filePath: '/uploads/cv.pdf' }], // falta fileType
      };
      await expect(addCandidate(invalidResumesArray)).rejects.toThrow(
        'Invalid CV data',
      );
    });
  });

  describe('Error de duplicado - Constraint de email único', () => {
    it('debe lanzar error específico cuando el email ya existe (P2002)', async () => {
      // Arrange
      mockPrisma.candidate.create.mockRejectedValue({ code: 'P2002' });

      // Act & Assert
      await expect(addCandidate(validCandidateData)).rejects.toThrow(
        'The email already exists in the database',
      );
      expect(mockPrisma.candidate.create).toHaveBeenCalled();
    });

    it('debe detectar duplicado incluso con datos relacionados', async () => {
      // Arrange
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [validEducationData],
      };

      mockPrisma.candidate.create.mockRejectedValue({ code: 'P2002' });

      // Act & Assert
      await expect(addCandidate(candidateWithEducation)).rejects.toThrow(
        'The email already exists in the database',
      );
    });
  });

  describe('Errores de base de datos', () => {
    it('debe propagar errores de Prisma distintos de P2002', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockPrisma.candidate.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(addCandidate(validCandidateData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('debe manejar error en el guardado de educación (nested write falla)', async () => {
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [validEducationData],
      };
      mockPrisma.candidate.create.mockRejectedValue(
        new Error('Education save failed'),
      );
      await expect(addCandidate(candidateWithEducation)).rejects.toThrow(
        'Education save failed',
      );
    });

    it('debe manejar error en el guardado de experiencia laboral (nested write falla)', async () => {
      const candidateWithExperience = {
        ...validCandidateData,
        workExperiences: [validExperienceData],
      };
      mockPrisma.candidate.create.mockRejectedValue(
        new Error('Experience save failed'),
      );
      await expect(addCandidate(candidateWithExperience)).rejects.toThrow(
        'Experience save failed',
      );
    });

    it('debe manejar error en el guardado de resume (nested write falla)', async () => {
      const candidateWithResume = {
        ...validCandidateData,
        resumes: [validCVData],
      };
      mockPrisma.candidate.create.mockRejectedValue(
        new Error('Resume save failed'),
      );
      await expect(addCandidate(candidateWithResume)).rejects.toThrow(
        'Resume save failed',
      );
    });
  });

  describe('Casos límite y edge cases', () => {
    it('debe manejar candidato sin teléfono (campo opcional)', async () => {
      // Arrange
      const candidateWithoutPhone = {
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        address: 'Calle del Prado 45',
      };

      const mockSavedCandidate = { id: 13, ...candidateWithoutPhone };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(candidateWithoutPhone);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'María',
          lastName: 'López',
          email: 'maria.lopez@example.com',
        }),
      });
    });

    it('debe manejar candidato sin dirección (campo opcional)', async () => {
      // Arrange
      const candidateWithoutAddress = {
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@example.com',
        phone: '687654321',
      };

      const mockSavedCandidate = { id: 14, ...candidateWithoutAddress };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(candidateWithoutAddress);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar educación sin fecha de fin (campo opcional)', async () => {
      const educationWithoutEndDate = {
        institution: 'Universidad de Barcelona',
        title: 'Doctorado en IA',
        startDate: '2023-09-01',
      };
      const candidateData = {
        ...validCandidateData,
        educations: [educationWithoutEndDate],
      };
      const mockSavedCandidate = { id: 15, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateData);
      expect(result).toEqual(mockSavedCandidate);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          educations: expect.objectContaining({
            create: [
              expect.objectContaining({
                institution: educationWithoutEndDate.institution,
                title: educationWithoutEndDate.title,
              }),
            ],
          }),
        }),
      });
    });

    it('debe manejar experiencia sin fecha de fin (campo opcional)', async () => {
      const experienceWithoutEndDate = {
        company: 'StartupXYZ',
        position: 'CTO',
        description: 'Posición actual',
        startDate: '2024-01-01',
      };
      const candidateData = {
        ...validCandidateData,
        workExperiences: [experienceWithoutEndDate],
      };
      const mockSavedCandidate = { id: 16, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateData);
      expect(result).toEqual(mockSavedCandidate);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workExperiences: expect.objectContaining({
            create: [
              expect.objectContaining({
                company: experienceWithoutEndDate.company,
                position: experienceWithoutEndDate.position,
              }),
            ],
          }),
        }),
      });
    });

    it('debe manejar experiencia sin descripción (campo opcional)', async () => {
      const experienceWithoutDescription = {
        company: 'Consulting SA',
        position: 'Consultor',
        startDate: '2020-03-01',
        endDate: '2022-08-31',
      };
      const candidateData = {
        ...validCandidateData,
        workExperiences: [experienceWithoutDescription],
      };
      const mockSavedCandidate = { id: 17, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateData);
      expect(result).toEqual(mockSavedCandidate);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workExperiences: expect.objectContaining({
            create: [expect.objectContaining({ description: undefined })],
          }),
        }),
      });
    });

    it('debe manejar resumes vacío (sin inserción)', async () => {
      const candidateWithEmptyResumes = {
        ...validCandidateData,
        resumes: [],
      };
      const mockSavedCandidate = { id: 18, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      const result = await addCandidate(candidateWithEmptyResumes);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.not.objectContaining({ resumes: expect.anything() }),
      });
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar nombres con caracteres especiales válidos (acentos y ñ)', async () => {
      // Arrange
      const candidateWithSpecialChars = {
        firstName: 'José María',
        lastName: 'Rodríguez Ñoño',
        email: 'jose.rodriguez@example.com',
        phone: '698765432',
        address: 'Plaza España 1',
      };

      const mockSavedCandidate = { id: 19, ...candidateWithSpecialChars };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(candidateWithSpecialChars);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'José María',
          lastName: 'Rodríguez Ñoño',
        }),
      });
    });

    it('debe incluir múltiples educaciones en el nested write', async () => {
      const education1 = { ...validEducationData };
      const education2 = {
        institution: 'ESADE',
        title: 'MBA',
        startDate: '2021-09-01',
        endDate: '2023-06-30',
      };
      const candidateData = {
        ...validCandidateData,
        educations: [education1, education2],
      };
      const mockSavedCandidate = { id: 20, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      await addCandidate(candidateData);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          educations: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ title: education1.title }),
              expect.objectContaining({ title: education2.title }),
            ]),
          }),
        }),
      });
    });

    it('debe incluir múltiples experiencias en el nested write', async () => {
      const experience1 = { ...validExperienceData };
      const experience2 = {
        company: 'New Tech',
        position: 'Senior Developer',
        startDate: '2024-01-01',
      };
      const candidateData = {
        ...validCandidateData,
        workExperiences: [experience1, experience2],
      };
      const mockSavedCandidate = { id: 21, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      await addCandidate(candidateData);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workExperiences: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ company: experience1.company }),
              expect.objectContaining({ company: experience2.company }),
            ]),
          }),
        }),
      });
    });
  });

  describe('Verificación de flujo completo', () => {
    it('debe retornar el candidato guardado con su ID asignado', async () => {
      // Arrange
      const expectedId = 100;
      const mockSavedCandidate = { id: expectedId, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);

      // Act
      const result = await addCandidate(validCandidateData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.id).toBe(expectedId);
      expect(result).toMatchObject({
        firstName: validCandidateData.firstName,
        lastName: validCandidateData.lastName,
        email: validCandidateData.email,
      });
    });

    it('debe construir un único nested write para candidato completo', async () => {
      const completeCandidateData = {
        ...validCandidateData,
        educations: [validEducationData],
        workExperiences: [validExperienceData],
        resumes: [validCVData],
      };
      const mockSavedCandidate = { id: 22, ...validCandidateData };
      mockPrisma.candidate.create.mockResolvedValue(mockSavedCandidate);
      await addCandidate(completeCandidateData);
      expect(mockPrisma.candidate.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          educations: expect.any(Object),
          workExperiences: expect.any(Object),
          resumes: expect.any(Object),
        }),
      });
    });
  });
});
