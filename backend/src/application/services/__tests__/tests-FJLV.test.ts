import { addCandidate } from '../candidateService';
import { validateCandidateData } from '../../validator';
import { Candidate } from '../../../domain/models/Candidate';
import { Education } from '../../../domain/models/Education';
import { WorkExperience } from '../../../domain/models/WorkExperience';
import { Resume } from '../../../domain/models/Resume';

// Mock de Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    candidate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
  })),
  Prisma: {
    PrismaClientKnownRequestError: function(message: any, code: any) {
      const error: any = new Error(message);
      error.name = 'PrismaClientKnownRequestError';
      error.code = code;
      return error;
    },
  },
}));

// Mock de los modelos de dominio
jest.mock('../../../domain/models/Candidate');
jest.mock('../../../domain/models/Education');
jest.mock('../../../domain/models/WorkExperience');
jest.mock('../../../domain/models/Resume');

describe('Candidate Insertion System - Tests by FJLV', () => {
  let mockCandidateInstance: any;
  let mockEducationInstance: any;
  let mockWorkExperienceInstance: any;
  let mockResumeInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de instancias de los modelos
    mockCandidateInstance = {
      save: jest.fn(),
      education: [],
      workExperience: [],
      resumes: [],
    };

    mockEducationInstance = {
      save: jest.fn(),
      candidateId: undefined,
    };

    mockWorkExperienceInstance = {
      save: jest.fn(),
      candidateId: undefined,
    };

    mockResumeInstance = {
      save: jest.fn(),
      candidateId: undefined,
    };

    // Mock de constructores usando sintaxis compatible
    (Candidate as any).mockImplementation(() => mockCandidateInstance);
    (Education as any).mockImplementation(() => mockEducationInstance);
    (WorkExperience as any).mockImplementation(() => mockWorkExperienceInstance);
    (Resume as any).mockImplementation(() => mockResumeInstance);
  });

  describe('Form Data Validation', () => {
    it('should pass validation with complete valid candidate data', async () => {
      const validCandidateData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        phone: '612345678',
        address: 'Calle Mayor 123, Madrid',
        educations: [
          {
            institution: 'Universidad Complutense Madrid',
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30'
          }
        ],
        workExperiences: [
          {
            company: 'Tech Solutions S.L.',
            position: 'Desarrollador Backend',
            description: 'Desarrollo de APIs REST con Node.js',
            startDate: '2022-07-01',
            endDate: '2024-12-01'
          }
        ],
        cv: {
          filePath: 'uploads/francisco-lucas-cv.pdf',
          fileType: 'application/pdf'
        }
      };

      mockCandidateInstance.save.mockResolvedValue({ id: 1, ...validCandidateData });
      mockEducationInstance.save.mockResolvedValue({ id: 1, candidateId: 1 });
      mockWorkExperienceInstance.save.mockResolvedValue({ id: 1, candidateId: 1 });
      mockResumeInstance.save.mockResolvedValue({ id: 1, candidateId: 1 });

      expect(() => validateCandidateData(validCandidateData)).not.toThrow();
      
      const result = await addCandidate(validCandidateData);
      
      expect(result).toBeDefined();
      expect(Candidate).toHaveBeenCalledWith(validCandidateData);
      expect(mockCandidateInstance.save).toHaveBeenCalled();
    });

    it('should fail validation for missing required firstName', async () => {
      const invalidData = {
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        phone: '612345678'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('should fail validation for missing required lastName', async () => {
      const invalidData = {
        firstName: 'Francisco',
        email: 'francisco.lucas@email.com',
        phone: '612345678'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('should fail validation for missing required email', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        phone: '612345678'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('should fail validation for invalid email format', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'invalid-email-format',
        phone: '612345678'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('should fail validation for invalid phone format', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        phone: '123456789' // No empieza por 6, 7 o 9
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid phone');
    });

    it('should fail validation for invalid name characters', async () => {
      const invalidData = {
        firstName: 'Francisco123', // Contiene números
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        phone: '612345678'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('should fail validation for name too short', async () => {
      const invalidData = {
        firstName: 'F', // Solo 1 carácter, mínimo 2
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        phone: '612345678'
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid name');
    });

    it('should fail validation for address too long', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        address: 'A'.repeat(101) // Más de 100 caracteres
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid address');
    });

    it('should fail validation for invalid education data', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        educations: [
          {
            institution: '', // Institución vacía
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30'
          }
        ]
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid institution');
    });

    it('should fail validation for invalid work experience data', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        workExperiences: [
          {
            company: '', // Empresa vacía
            position: 'Desarrollador',
            startDate: '2022-07-01'
          }
        ]
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid company');
    });

    it('should fail validation for invalid date format', async () => {
      const invalidData = {
        firstName: 'Francisco',
        lastName: 'Lucas',
        email: 'francisco.lucas@email.com',
        educations: [
          {
            institution: 'Universidad',
            title: 'Ingeniería',
            startDate: '2018/09/01', // Formato incorrecto
            endDate: '2022-06-30'
          }
        ]
      };

      await expect(addCandidate(invalidData)).rejects.toThrow('Invalid date');
    });
  });

  describe('Database Insertion', () => {
    const validCandidateData = {
      firstName: 'Francisco',
      lastName: 'Lucas',
      email: 'francisco.lucas@email.com',
      phone: '612345678',
      address: 'Calle Mayor 123, Madrid'
    };

    it('should successfully insert candidate into database', async () => {
      const expectedResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedResult);

      const result = await addCandidate(validCandidateData);

      expect(result).toEqual(expectedResult);
      expect(Candidate).toHaveBeenCalledWith(validCandidateData);
      expect(mockCandidateInstance.save).toHaveBeenCalled();
    });

    it('should successfully insert candidate with education data', async () => {
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30'
          }
        ]
      };

      const expectedCandidateResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockEducationInstance.save.mockResolvedValue({ id: 1, candidateId: 1 });

      const result = await addCandidate(candidateWithEducation);

      expect(result).toEqual(expectedCandidateResult);
      expect(Education).toHaveBeenCalledWith(candidateWithEducation.educations[0]);
      expect(mockEducationInstance.save).toHaveBeenCalled();
      expect(mockEducationInstance.candidateId).toBe(1);
    });

    it('should successfully insert candidate with work experience data', async () => {
      const candidateWithExperience = {
        ...validCandidateData,
        workExperiences: [
          {
            company: 'Tech Solutions',
            position: 'Desarrollador Backend',
            description: 'Desarrollo con Node.js',
            startDate: '2022-07-01',
            endDate: '2024-12-01'
          }
        ]
      };

      const expectedCandidateResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockWorkExperienceInstance.save.mockResolvedValue({ id: 1, candidateId: 1 });

      const result = await addCandidate(candidateWithExperience);

      expect(result).toEqual(expectedCandidateResult);
      expect(WorkExperience).toHaveBeenCalledWith(candidateWithExperience.workExperiences[0]);
      expect(mockWorkExperienceInstance.save).toHaveBeenCalled();
      expect(mockWorkExperienceInstance.candidateId).toBe(1);
    });

    it('should successfully insert candidate with CV data', async () => {
      const candidateWithCV = {
        ...validCandidateData,
        cv: {
          filePath: 'uploads/francisco-lucas-cv.pdf',
          fileType: 'application/pdf'
        }
      };

      const expectedCandidateResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockResumeInstance.save.mockResolvedValue({ id: 1, candidateId: 1 });

      const result = await addCandidate(candidateWithCV);

      expect(result).toEqual(expectedCandidateResult);
      expect(Resume).toHaveBeenCalledWith(candidateWithCV.cv);
      expect(mockResumeInstance.save).toHaveBeenCalled();
      expect(mockResumeInstance.candidateId).toBe(1);
    });

    it('should handle duplicate email error gracefully', async () => {
      const duplicateEmailError: any = new Error('The email already exists in the database');
      duplicateEmailError.name = 'PrismaClientKnownRequestError';
      duplicateEmailError.code = 'P2002';
      
      mockCandidateInstance.save.mockRejectedValue(duplicateEmailError);

      await expect(addCandidate(validCandidateData)).rejects.toThrow('The email already exists in the database');
    });

    it('should handle database connection error gracefully', async () => {
      const connectionError = new Error('Database connection failed');
      connectionError.name = 'PrismaClientInitializationError';
      
      mockCandidateInstance.save.mockRejectedValue(connectionError);

      await expect(addCandidate(validCandidateData)).rejects.toThrow(connectionError);
    });

    it('should handle generic database error gracefully', async () => {
      const genericError = new Error('Unexpected database error');
      
      mockCandidateInstance.save.mockRejectedValue(genericError);

      await expect(addCandidate(validCandidateData)).rejects.toThrow('Unexpected database error');
    });

    it('should handle education save failure', async () => {
      const candidateWithEducation = {
        ...validCandidateData,
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30'
          }
        ]
      };

      const expectedCandidateResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockEducationInstance.save.mockRejectedValue(new Error('Education save failed'));

      await expect(addCandidate(candidateWithEducation)).rejects.toThrow('Education save failed');
    });

    it('should handle work experience save failure', async () => {
      const candidateWithExperience = {
        ...validCandidateData,
        workExperiences: [
          {
            company: 'Tech Solutions',
            position: 'Desarrollador Backend',
            startDate: '2022-07-01'
          }
        ]
      };

      const expectedCandidateResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockWorkExperienceInstance.save.mockRejectedValue(new Error('Work experience save failed'));

      await expect(addCandidate(candidateWithExperience)).rejects.toThrow('Work experience save failed');
    });

    it('should handle resume save failure', async () => {
      const candidateWithCV = {
        ...validCandidateData,
        cv: {
          filePath: 'uploads/francisco-lucas-cv.pdf',
          fileType: 'application/pdf'
        }
      };

      const expectedCandidateResult = { id: 1, ...validCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockResumeInstance.save.mockRejectedValue(new Error('Resume save failed'));

      await expect(addCandidate(candidateWithCV)).rejects.toThrow('Resume save failed');
    });
  });

  describe('Complete Candidate Insertion Flow', () => {
    it('should successfully insert a complete candidate with all related data', async () => {
      const completeCandidateData = {
        firstName: 'Francisco José',
        lastName: 'Lucas Vázquez',
        email: 'francisco.jose.lucas@email.com',
        phone: '687654321',
        address: 'Avenida de la Constitución 45, 3ºA, Sevilla',
        educations: [
          {
            institution: 'Universidad de Sevilla',
            title: 'Grado en Ingeniería del Software',
            startDate: '2016-09-01',
            endDate: '2020-06-30'
          },
          {
            institution: 'Universidad Politécnica de Madrid',
            title: 'Máster en Desarrollo de Software',
            startDate: '2020-09-01',
            endDate: '2022-06-30'
          }
        ],
        workExperiences: [
          {
            company: 'StartupTech',
            position: 'Junior Developer',
            description: 'Desarrollo frontend con React',
            startDate: '2020-07-01',
            endDate: '2021-12-31'
          },
          {
            company: 'Enterprise Solutions',
            position: 'Senior Backend Developer',
            description: 'Desarrollo de microservicios con Node.js y TypeScript',
            startDate: '2022-01-01',
            endDate: '2024-11-30'
          }
        ],
        cv: {
          filePath: 'uploads/1732970400000-francisco-jose-lucas-cv.pdf',
          fileType: 'application/pdf'
        }
      };

      const expectedCandidateResult = { id: 42, ...completeCandidateData };
      mockCandidateInstance.save.mockResolvedValue(expectedCandidateResult);
      mockEducationInstance.save
        .mockResolvedValueOnce({ id: 1, candidateId: 42 })
        .mockResolvedValueOnce({ id: 2, candidateId: 42 });
      mockWorkExperienceInstance.save
        .mockResolvedValueOnce({ id: 1, candidateId: 42 })
        .mockResolvedValueOnce({ id: 2, candidateId: 42 });
      mockResumeInstance.save.mockResolvedValue({ id: 1, candidateId: 42 });

      const result = await addCandidate(completeCandidateData);

      // Verificaciones del candidato principal
      expect(result).toEqual(expectedCandidateResult);
      expect(Candidate).toHaveBeenCalledWith(completeCandidateData);
      expect(mockCandidateInstance.save).toHaveBeenCalled();

      // Verificaciones de educación
      expect(Education).toHaveBeenCalledTimes(2);
      expect(Education).toHaveBeenNthCalledWith(1, completeCandidateData.educations[0]);
      expect(Education).toHaveBeenNthCalledWith(2, completeCandidateData.educations[1]);
      expect(mockEducationInstance.save).toHaveBeenCalledTimes(2);

      // Verificaciones de experiencia laboral
      expect(WorkExperience).toHaveBeenCalledTimes(2);
      expect(WorkExperience).toHaveBeenNthCalledWith(1, completeCandidateData.workExperiences[0]);
      expect(WorkExperience).toHaveBeenNthCalledWith(2, completeCandidateData.workExperiences[1]);
      expect(mockWorkExperienceInstance.save).toHaveBeenCalledTimes(2);

      // Verificaciones del CV
      expect(Resume).toHaveBeenCalledWith(completeCandidateData.cv);
      expect(mockResumeInstance.save).toHaveBeenCalled();

      // Verificar que se asignó el candidateId correctamente
      expect(mockEducationInstance.candidateId).toBe(42);
      expect(mockWorkExperienceInstance.candidateId).toBe(42);
      expect(mockResumeInstance.candidateId).toBe(42);

      // Verificar que se añadieron al array del candidato
      expect(mockCandidateInstance.education).toHaveLength(2);
      expect(mockCandidateInstance.workExperience).toHaveLength(2);
      expect(mockCandidateInstance.resumes).toHaveLength(1);
    });
  });
});