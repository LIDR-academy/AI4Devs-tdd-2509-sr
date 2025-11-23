import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { validateCandidateData } from '../application/validator';

// Mock de los módulos
jest.mock('../application/validator');
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

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
    (validateCandidateData as unknown as jest.Mock).mockImplementation(() => {});
  });

  describe('Caso feliz - Inserción exitosa', () => {
    it('debe insertar un candidato correctamente con todos los campos obligatorios', async () => {
      // Arrange
      const mockSavedCandidate = { id: 1, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act
      const result = await addCandidate(validCandidateData);

      // Assert
      expect(validateCandidateData).toHaveBeenCalledWith(validCandidateData);
      expect(Candidate).toHaveBeenCalledWith(validCandidateData);
      expect(mockCandidateInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con educación', async () => {
      // Arrange
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [validEducationData],
      };

      const mockSavedCandidate = { id: 2, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validEducationData }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock).mockImplementation(() => mockEducationInstance);

      // Act
      const result = await addCandidate(candidateWithEducation);

      // Assert
      expect(Education).toHaveBeenCalledWith(validEducationData);
      expect(mockEducationInstance.candidateId).toBe(2);
      expect(mockEducationInstance.save).toHaveBeenCalled();
      expect(mockCandidateInstance.education).toHaveLength(1);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con experiencia laboral', async () => {
      // Arrange
      const candidateWithExperience = {
        ...validCandidateData,
        workExperiences: [validExperienceData],
      };

      const mockSavedCandidate = { id: 3, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockExperienceInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validExperienceData }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (WorkExperience as jest.Mock).mockImplementation(
        () => mockExperienceInstance,
      );

      // Act
      const result = await addCandidate(candidateWithExperience);

      // Assert
      expect(WorkExperience).toHaveBeenCalledWith(validExperienceData);
      expect(mockExperienceInstance.candidateId).toBe(3);
      expect(mockExperienceInstance.save).toHaveBeenCalled();
      expect(mockCandidateInstance.workExperience).toHaveLength(1);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con CV', async () => {
      // Arrange
      const candidateWithCV = {
        ...validCandidateData,
        cv: validCVData,
      };

      const mockSavedCandidate = { id: 4, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockResumeInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validCVData }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Resume as jest.Mock).mockImplementation(() => mockResumeInstance);

      // Act
      const result = await addCandidate(candidateWithCV);

      // Assert
      expect(Resume).toHaveBeenCalledWith(validCVData);
      expect(mockResumeInstance.candidateId).toBe(4);
      expect(mockResumeInstance.save).toHaveBeenCalled();
      expect(mockCandidateInstance.resumes).toHaveLength(1);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato completo con educación, experiencia y CV', async () => {
      // Arrange
      const completeCandidateData = {
        ...validCandidateData,
        educations: [validEducationData],
        workExperiences: [validExperienceData],
        cv: validCVData,
      };

      const mockSavedCandidate = { id: 5, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validEducationData }),
      };

      const mockExperienceInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validExperienceData }),
      };

      const mockResumeInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validCVData }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock).mockImplementation(() => mockEducationInstance);
      (WorkExperience as jest.Mock).mockImplementation(
        () => mockExperienceInstance,
      );
      (Resume as jest.Mock).mockImplementation(() => mockResumeInstance);

      // Act
      const result = await addCandidate(completeCandidateData);

      // Assert
      expect(validateCandidateData).toHaveBeenCalledWith(completeCandidateData);
      expect(Candidate).toHaveBeenCalledWith(completeCandidateData);
      expect(Education).toHaveBeenCalledWith(validEducationData);
      expect(WorkExperience).toHaveBeenCalledWith(validExperienceData);
      expect(Resume).toHaveBeenCalledWith(validCVData);
      expect(mockCandidateInstance.education).toHaveLength(1);
      expect(mockCandidateInstance.workExperience).toHaveLength(1);
      expect(mockCandidateInstance.resumes).toHaveLength(1);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con múltiples registros de educación', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance1 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validEducationData }),
      };

      const mockEducationInstance2 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 2, ...education2 }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock)
        .mockImplementationOnce(() => mockEducationInstance1)
        .mockImplementationOnce(() => mockEducationInstance2);

      // Act
      const result = await addCandidate(candidateWithMultipleEducation);

      // Assert
      expect(Education).toHaveBeenCalledTimes(2);
      expect(mockCandidateInstance.education).toHaveLength(2);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe insertar un candidato con múltiples experiencias laborales', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockExperienceInstance1 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...validExperienceData }),
      };

      const mockExperienceInstance2 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 2, ...experience2 }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (WorkExperience as jest.Mock)
        .mockImplementationOnce(() => mockExperienceInstance1)
        .mockImplementationOnce(() => mockExperienceInstance2);

      // Act
      const result = await addCandidate(candidateWithMultipleExperience);

      // Assert
      expect(WorkExperience).toHaveBeenCalledTimes(2);
      expect(mockCandidateInstance.workExperience).toHaveLength(2);
      expect(result).toEqual(mockSavedCandidate);
    });
  });

  describe('Errores de validación', () => {
    it('debe lanzar error si la validación falla', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, firstName: '' };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid name');
      });

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
      expect(Candidate).not.toHaveBeenCalled();
    });

    it('debe lanzar error si firstName no es válido', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, firstName: '123' };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid name');
      });

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si lastName no es válido', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, lastName: 'G' };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid name');
      });

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si el email no es válido', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, email: 'email-invalido' };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid email');
      });

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('debe lanzar error si el teléfono no es válido', async () => {
      // Arrange
      const invalidData = { ...validCandidateData, phone: '123456789' };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid phone');
      });

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid phone');
    });

    it('debe lanzar error si la dirección excede el límite', async () => {
      // Arrange
      const invalidData = {
        ...validCandidateData,
        address: 'A'.repeat(101),
      };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid address');
      });

      // Act & Assert
      await expect(addCandidate(invalidData)).rejects.toThrow(
        'Invalid address',
      );
    });

    it('debe lanzar error si la educación no es válida', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, institution: '' }],
      };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid institution');
      });

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid institution',
      );
    });

    it('debe lanzar error si el título de educación no es válido', async () => {
      // Arrange
      const invalidEducation = {
        ...validCandidateData,
        educations: [{ ...validEducationData, title: '' }],
      };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid title');
      });

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
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid date');
      });

      // Act & Assert
      await expect(addCandidate(invalidEducation)).rejects.toThrow(
        'Invalid date',
      );
    });

    it('debe lanzar error si la experiencia laboral no es válida', async () => {
      // Arrange
      const invalidExperience = {
        ...validCandidateData,
        workExperiences: [{ ...validExperienceData, company: '' }],
      };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid company');
      });

      // Act & Assert
      await expect(addCandidate(invalidExperience)).rejects.toThrow(
        'Invalid company',
      );
    });

    it('debe lanzar error si la posición no es válida', async () => {
      // Arrange
      const invalidExperience = {
        ...validCandidateData,
        workExperiences: [{ ...validExperienceData, position: '' }],
      };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid position');
      });

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
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid description');
      });

      // Act & Assert
      await expect(addCandidate(invalidExperience)).rejects.toThrow(
        'Invalid description',
      );
    });

    it('debe lanzar error si el CV no es válido', async () => {
      // Arrange
      const invalidCV = {
        ...validCandidateData,
        cv: { filePath: 123 },
      };
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid CV data');
      });

      // Act & Assert
      await expect(addCandidate(invalidCV)).rejects.toThrow('Invalid CV data');
    });
  });

  describe('Error de duplicado - Constraint de email único', () => {
    it('debe lanzar error específico cuando el email ya existe (P2002)', async () => {
      // Arrange
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockRejectedValue({ code: 'P2002' }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act & Assert
      await expect(addCandidate(validCandidateData)).rejects.toThrow(
        'The email already exists in the database',
      );
      expect(mockCandidateInstance.save).toHaveBeenCalled();
    });

    it('debe detectar duplicado incluso con educación incluida', async () => {
      // Arrange
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [validEducationData],
      };

      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockRejectedValue({ code: 'P2002' }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockRejectedValue(dbError),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act & Assert
      await expect(addCandidate(validCandidateData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('debe manejar error en el guardado de educación', async () => {
      // Arrange
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [validEducationData],
      };

      const mockSavedCandidate = { id: 10, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance = {
        candidateId: undefined,
        save: jest.fn().mockRejectedValue(new Error('Education save failed')),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock).mockImplementation(() => mockEducationInstance);

      // Act & Assert
      await expect(addCandidate(candidateWithEducation)).rejects.toThrow(
        'Education save failed',
      );
    });

    it('debe manejar error en el guardado de experiencia laboral', async () => {
      // Arrange
      const candidateWithExperience = {
        ...validCandidateData,
        workExperiences: [validExperienceData],
      };

      const mockSavedCandidate = { id: 11, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockExperienceInstance = {
        candidateId: undefined,
        save: jest.fn().mockRejectedValue(new Error('Experience save failed')),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (WorkExperience as jest.Mock).mockImplementation(
        () => mockExperienceInstance,
      );

      // Act & Assert
      await expect(addCandidate(candidateWithExperience)).rejects.toThrow(
        'Experience save failed',
      );
    });

    it('debe manejar error en el guardado de CV', async () => {
      // Arrange
      const candidateWithCV = {
        ...validCandidateData,
        cv: validCVData,
      };

      const mockSavedCandidate = { id: 12, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockResumeInstance = {
        candidateId: undefined,
        save: jest.fn().mockRejectedValue(new Error('Resume save failed')),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Resume as jest.Mock).mockImplementation(() => mockResumeInstance);

      // Act & Assert
      await expect(addCandidate(candidateWithCV)).rejects.toThrow(
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act
      const result = await addCandidate(candidateWithoutPhone);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
      expect(validateCandidateData).toHaveBeenCalledWith(candidateWithoutPhone);
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act
      const result = await addCandidate(candidateWithoutAddress);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar educación sin fecha de fin (campo opcional)', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance = {
        candidateId: undefined,
        save: jest
          .fn()
          .mockResolvedValue({ id: 1, ...educationWithoutEndDate }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock).mockImplementation(() => mockEducationInstance);

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(Education).toHaveBeenCalledWith(educationWithoutEndDate);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar experiencia sin fecha de fin (campo opcional)', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockExperienceInstance = {
        candidateId: undefined,
        save: jest
          .fn()
          .mockResolvedValue({ id: 1, ...experienceWithoutEndDate }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (WorkExperience as jest.Mock).mockImplementation(
        () => mockExperienceInstance,
      );

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(WorkExperience).toHaveBeenCalledWith(experienceWithoutEndDate);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar experiencia sin descripción (campo opcional)', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockExperienceInstance = {
        candidateId: undefined,
        save: jest
          .fn()
          .mockResolvedValue({ id: 1, ...experienceWithoutDescription }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (WorkExperience as jest.Mock).mockImplementation(
        () => mockExperienceInstance,
      );

      // Act
      const result = await addCandidate(candidateData);

      // Assert
      expect(WorkExperience).toHaveBeenCalledWith(experienceWithoutDescription);
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar CV vacío (sin inserción)', async () => {
      // Arrange
      const candidateWithEmptyCV = {
        ...validCandidateData,
        cv: {},
      };

      const mockSavedCandidate = { id: 18, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act
      const result = await addCandidate(candidateWithEmptyCV);

      // Assert
      expect(Resume).not.toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe manejar nombres con caracteres especiales válidos', async () => {
      // Arrange
      const candidateWithSpecialChars = {
        firstName: 'José María',
        lastName: 'Rodríguez Ñoño',
        email: 'jose.rodriguez@example.com',
        phone: '698765432',
        address: 'Plaza España 1',
      };

      const mockSavedCandidate = { id: 19, ...candidateWithSpecialChars };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act
      const result = await addCandidate(candidateWithSpecialChars);

      // Assert
      expect(result).toEqual(mockSavedCandidate);
    });

    it('debe asignar correctamente candidateId a múltiples educaciones', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance1 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...education1 }),
      };

      const mockEducationInstance2 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 2, ...education2 }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock)
        .mockImplementationOnce(() => mockEducationInstance1)
        .mockImplementationOnce(() => mockEducationInstance2);

      // Act
      await addCandidate(candidateData);

      // Assert
      expect(mockEducationInstance1.candidateId).toBe(20);
      expect(mockEducationInstance2.candidateId).toBe(20);
    });

    it('debe asignar correctamente candidateId a múltiples experiencias', async () => {
      // Arrange
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
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockExperienceInstance1 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1, ...experience1 }),
      };

      const mockExperienceInstance2 = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 2, ...experience2 }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (WorkExperience as jest.Mock)
        .mockImplementationOnce(() => mockExperienceInstance1)
        .mockImplementationOnce(() => mockExperienceInstance2);

      // Act
      await addCandidate(candidateData);

      // Assert
      expect(mockExperienceInstance1.candidateId).toBe(21);
      expect(mockExperienceInstance2.candidateId).toBe(21);
    });
  });

  describe('Verificación de flujo completo', () => {
    it('debe ejecutar el flujo en el orden correcto: validar -> candidato -> educación -> experiencia -> CV', async () => {
      // Arrange
      const completeCandidateData = {
        ...validCandidateData,
        educations: [validEducationData],
        workExperiences: [validExperienceData],
        cv: validCVData,
      };

      const mockSavedCandidate = { id: 22, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      const mockEducationInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1 }),
      };

      const mockExperienceInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1 }),
      };

      const mockResumeInstance = {
        candidateId: undefined,
        save: jest.fn().mockResolvedValue({ id: 1 }),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);
      (Education as jest.Mock).mockImplementation(() => mockEducationInstance);
      (WorkExperience as jest.Mock).mockImplementation(
        () => mockExperienceInstance,
      );
      (Resume as jest.Mock).mockImplementation(() => mockResumeInstance);

      // Act
      await addCandidate(completeCandidateData);

      // Assert - Verificar orden de ejecución
      const callOrder = [
        validateCandidateData.mock.invocationCallOrder[0],
        Candidate.mock.invocationCallOrder[0],
        mockCandidateInstance.save.mock.invocationCallOrder[0],
        Education.mock.invocationCallOrder[0],
        mockEducationInstance.save.mock.invocationCallOrder[0],
        WorkExperience.mock.invocationCallOrder[0],
        mockExperienceInstance.save.mock.invocationCallOrder[0],
        Resume.mock.invocationCallOrder[0],
        mockResumeInstance.save.mock.invocationCallOrder[0],
      ];

      // Verificar que cada llamada ocurrió después de la anterior
      for (let i = 1; i < callOrder.length; i++) {
        expect(callOrder[i]).toBeGreaterThan(callOrder[i - 1]);
      }
    });

    it('debe retornar el candidato guardado con su ID asignado', async () => {
      // Arrange
      const expectedId = 100;
      const mockSavedCandidate = { id: expectedId, ...validCandidateData };
      const mockCandidateInstance = {
        education: [],
        workExperience: [],
        resumes: [],
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
      };

      (Candidate as jest.Mock).mockImplementation(() => mockCandidateInstance);

      // Act
      const result = await addCandidate(validCandidateData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.id).toBe(expectedId);
      expect(result).toMatchObject(validCandidateData);
    });
  });
});
