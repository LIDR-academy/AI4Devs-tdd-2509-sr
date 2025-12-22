// Mock de PrismaClient antes de importar los módulos que lo usan
const mockPrisma = {
  candidate: {
    create: jest.fn(),
    update: jest.fn()
  }
};

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

import { validateCandidateData } from '../application/validator';
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { PrismaClient, Prisma } from '@prisma/client';

// ============================================================================
// TESTS DE VALIDACIÓN DE DATOS
// ============================================================================

describe('Validator - validateCandidateData', () => {
  describe('Candidato válido completo', () => {
    it('debe validar exitosamente un candidato con todos los campos', () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@example.com',
        phone: '612345678',
        address: 'Calle Mayor 1',
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2010-09-01',
            endDate: '2014-06-30'
          }
        ],
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Desarrollador',
            description: 'Desarrollo de aplicaciones web',
            startDate: '2015-01-15',
            endDate: '2018-03-20'
          }
        ],
        cv: {
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf'
        }
      };

      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('debe validar candidato con campos opcionales', () => {
      const candidateData = {
        firstName: 'María',
        lastName: 'González',
        email: 'maria@example.com'
      };

      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });

  describe('Campos requeridos faltantes', () => {
    it('debe lanzar error cuando falta firstName', () => {
      const candidateData = {
        lastName: 'Pérez',
        email: 'test@example.com'
      };

      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('debe lanzar error cuando falta lastName', () => {
      const candidateData = {
        firstName: 'Juan',
        email: 'test@example.com'
      };

      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('debe lanzar error cuando falta email', () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez'
      };

      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });
  });

  describe('Validación de nombres', () => {
    it('debe aceptar nombres válidos con acentos y espacios', () => {
      expect(() => validateCandidateData({
        firstName: 'José María',
        lastName: 'García-López',
        email: 'test@example.com'
      })).not.toThrow();
    });

    it('debe rechazar nombres con menos de 2 caracteres', () => {
      expect(() => validateCandidateData({
        firstName: 'A',
        lastName: 'Pérez',
        email: 'test@example.com'
      })).toThrow('Invalid name');
    });

    it('debe rechazar nombres con más de 100 caracteres', () => {
      const longName = 'A'.repeat(101);
      expect(() => validateCandidateData({
        firstName: longName,
        lastName: 'Pérez',
        email: 'test@example.com'
      })).toThrow('Invalid name');
    });

    it('debe rechazar nombres con números', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan123',
        lastName: 'Pérez',
        email: 'test@example.com'
      })).toThrow('Invalid name');
    });
  });

  describe('Validación de email', () => {
    it('debe aceptar emails válidos', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com'
      })).not.toThrow();
    });

    it('debe rechazar emails con formato inválido', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'email-invalido'
      })).toThrow('Invalid email');
    });

    it('debe rechazar email vacío', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: ''
      })).toThrow('Invalid email');
    });
  });

  describe('Validación de teléfono', () => {
    it('debe aceptar teléfonos válidos que empiezan con 6, 7 o 9', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        phone: '612345678'
      })).not.toThrow();

      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        phone: '712345678'
      })).not.toThrow();

      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        phone: '912345678'
      })).not.toThrow();
    });

    it('debe aceptar teléfono opcional (undefined)', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        phone: undefined
      })).not.toThrow();
    });

    it('debe rechazar teléfonos con formato inválido', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        phone: '123456789'
      })).toThrow('Invalid phone');
    });
  });

  describe('Validación de educación', () => {
    it('debe validar educación completa', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        educations: [{
          institution: 'Universidad',
          title: 'Grado',
          startDate: '2010-09-01',
          endDate: '2014-06-30'
        }]
      })).not.toThrow();
    });

    it('debe rechazar educación sin institución', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        educations: [{
          title: 'Grado',
          startDate: '2010-09-01'
        }]
      })).toThrow('Invalid institution');
    });

    it('debe rechazar educación sin título', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        educations: [{
          institution: 'Universidad',
          startDate: '2010-09-01'
        }]
      })).toThrow('Invalid title');
    });

    it('debe rechazar educación con fecha inválida', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        educations: [{
          institution: 'Universidad',
          title: 'Grado',
          startDate: '01-09-2010'
        }]
      })).toThrow('Invalid date');
    });
  });

  describe('Validación de experiencia laboral', () => {
    it('debe validar experiencia completa', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        workExperiences: [{
          company: 'Tech Corp',
          position: 'Desarrollador',
          description: 'Desarrollo web',
          startDate: '2015-01-15',
          endDate: '2018-03-20'
        }]
      })).not.toThrow();
    });

    it('debe rechazar experiencia sin empresa', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        workExperiences: [{
          position: 'Desarrollador',
          startDate: '2015-01-15'
        }]
      })).toThrow('Invalid company');
    });

    it('debe rechazar experiencia sin puesto', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        workExperiences: [{
          company: 'Tech Corp',
          startDate: '2015-01-15'
        }]
      })).toThrow('Invalid position');
    });

    it('debe rechazar experiencia con fecha inválida', () => {
      expect(() => validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        workExperiences: [{
          company: 'Tech Corp',
          position: 'Desarrollador',
          startDate: '15-01-2015'
        }]
      })).toThrow('Invalid date');
    });
  });
});

// ============================================================================
// TESTS DE SERVICIO - addCandidate
// ============================================================================

describe('CandidateService - addCandidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Guardado exitoso sin relaciones', () => {
    it('debe guardar candidato sin relaciones', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      const mockSavedCandidate = { id: 1, ...candidateData };

      // Mock de Candidate
      const mockSave = jest.fn().mockResolvedValue(mockSavedCandidate);
      const mockConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          education: [],
          workExperience: [],
          resumes: [],
          save: mockSave
        };
      });

      jest.spyOn(require('../domain/models/Candidate'), 'Candidate').mockImplementation(mockConstructor);

      const result = await addCandidate(candidateData);

      expect(mockConstructor).toHaveBeenCalledWith(candidateData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });
  });

  describe('Guardado con educación', () => {
    it('debe guardar candidato con educación', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        educations: [
          {
            institution: 'Universidad',
            title: 'Grado',
            startDate: '2010-09-01',
            endDate: '2014-06-30'
          }
        ]
      };

      const mockSavedCandidate = { id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' };
      const mockEducationSave = jest.fn().mockResolvedValue({ id: 1 });

      // Mock de Candidate
      const mockCandidateSave = jest.fn().mockResolvedValue(mockSavedCandidate);
      const mockCandidateConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          education: [],
          workExperience: [],
          resumes: [],
          save: mockCandidateSave
        };
      });

      // Mock de Education
      const mockEducationConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          candidateId: undefined,
          save: mockEducationSave
        };
      });

      jest.spyOn(require('../domain/models/Candidate'), 'Candidate').mockImplementation(mockCandidateConstructor);
      jest.spyOn(require('../domain/models/Education'), 'Education').mockImplementation(mockEducationConstructor);

      await addCandidate(candidateData);

      expect(mockCandidateSave).toHaveBeenCalled();
      expect(mockEducationConstructor).toHaveBeenCalledWith(candidateData.educations[0]);
      expect(mockEducationSave).toHaveBeenCalled();
    });
  });

  describe('Guardado con experiencia laboral', () => {
    it('debe guardar candidato con experiencia laboral', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Desarrollador',
            startDate: '2015-01-15'
          }
        ]
      };

      const mockSavedCandidate = { id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' };
      const mockExperienceSave = jest.fn().mockResolvedValue({ id: 1 });

      // Mock de Candidate
      const mockCandidateSave = jest.fn().mockResolvedValue(mockSavedCandidate);
      const mockCandidateConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          education: [],
          workExperience: [],
          resumes: [],
          save: mockCandidateSave
        };
      });

      // Mock de WorkExperience
      const mockExperienceConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          candidateId: undefined,
          save: mockExperienceSave
        };
      });

      jest.spyOn(require('../domain/models/Candidate'), 'Candidate').mockImplementation(mockCandidateConstructor);
      jest.spyOn(require('../domain/models/WorkExperience'), 'WorkExperience').mockImplementation(mockExperienceConstructor);

      await addCandidate(candidateData);

      expect(mockCandidateSave).toHaveBeenCalled();
      expect(mockExperienceConstructor).toHaveBeenCalledWith(candidateData.workExperiences[0]);
      expect(mockExperienceSave).toHaveBeenCalled();
    });
  });

  describe('Guardado con CV', () => {
    it('debe guardar candidato con CV', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        cv: {
          filePath: 'uploads/cv.pdf',
          fileType: 'application/pdf'
        }
      };

      const mockSavedCandidate = { id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' };
      const mockResumeSave = jest.fn().mockResolvedValue({ id: 1 });

      // Mock de Candidate
      const mockCandidateSave = jest.fn().mockResolvedValue(mockSavedCandidate);
      const mockCandidateConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          education: [],
          workExperience: [],
          resumes: [],
          save: mockCandidateSave
        };
      });

      // Mock de Resume
      const mockResumeConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          candidateId: undefined,
          save: mockResumeSave
        };
      });

      jest.spyOn(require('../domain/models/Candidate'), 'Candidate').mockImplementation(mockCandidateConstructor);
      jest.spyOn(require('../domain/models/Resume'), 'Resume').mockImplementation(mockResumeConstructor);

      await addCandidate(candidateData);

      expect(mockCandidateSave).toHaveBeenCalled();
      expect(mockResumeConstructor).toHaveBeenCalledWith(candidateData.cv);
      expect(mockResumeSave).toHaveBeenCalled();
    });
  });

  describe('Error de validación', () => {
    it('debe propagar error cuando la validación falla', async () => {
      const candidateData = {
        firstName: '',
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      await expect(addCandidate(candidateData)).rejects.toThrow();
    });
  });

  describe('Error de email duplicado', () => {
    it('debe manejar error de email duplicado (P2002)', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      const mockSave = jest.fn().mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed'
      });

      const mockConstructor = jest.fn().mockImplementation((data) => {
        return {
          ...data,
          education: [],
          workExperience: [],
          resumes: [],
          save: mockSave
        };
      });

      jest.spyOn(require('../domain/models/Candidate'), 'Candidate').mockImplementation(mockConstructor);

      await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
    });
  });
});

// ============================================================================
// TESTS DE MODELO - Candidate.save()
// ============================================================================

describe('Candidate - save()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Creación de nuevo candidato', () => {
    it('debe crear candidato en la base de datos', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '612345678',
        address: 'Calle Mayor 1'
      };

      const mockCreatedCandidate = { id: 1, ...candidateData };

      mockPrisma.candidate.create.mockResolvedValue(mockCreatedCandidate);

      const candidate = new Candidate(candidateData);
      const result = await candidate.save();

      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: {
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          phone: candidateData.phone,
          address: candidateData.address
        }
      });
      expect(result).toEqual(mockCreatedCandidate);
    });
  });

  describe('Creación con relaciones anidadas', () => {
    it('debe crear candidato con educations, workExperiences y resumes', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        education: [
          {
            institution: 'Universidad',
            title: 'Grado',
            startDate: new Date('2010-09-01'),
            endDate: new Date('2014-06-30')
          }
        ],
        workExperience: [
          {
            company: 'Tech Corp',
            position: 'Desarrollador',
            startDate: new Date('2015-01-15')
          }
        ],
        resumes: [
          {
            filePath: 'uploads/cv.pdf',
            fileType: 'application/pdf'
          }
        ]
      };

      const mockCreatedCandidate = { id: 1, ...candidateData };

      mockPrisma.candidate.create.mockResolvedValue(mockCreatedCandidate);

      const candidate = new Candidate(candidateData);
      const result = await candidate.save();

      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: {
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          email: candidateData.email,
          educations: {
            create: [{
              institution: candidateData.education[0].institution,
              title: candidateData.education[0].title,
              startDate: candidateData.education[0].startDate,
              endDate: candidateData.education[0].endDate
            }]
          },
          workExperiences: {
            create: [{
              company: candidateData.workExperience[0].company,
              position: candidateData.workExperience[0].position,
              description: candidateData.workExperience[0].description,
              startDate: candidateData.workExperience[0].startDate,
              endDate: candidateData.workExperience[0].endDate
            }]
          },
          resumes: {
            create: [{
              filePath: candidateData.resumes[0].filePath,
              fileType: candidateData.resumes[0].fileType
            }]
          }
        }
      });
      expect(result).toEqual(mockCreatedCandidate);
    });
  });

  describe('Error de conexión a BD', () => {
    it('debe manejar error de conexión a la base de datos', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      const connectionError = new Prisma.PrismaClientInitializationError('Connection failed', {
        clientVersion: '5.0.0'
      });

      mockPrisma.candidate.create.mockRejectedValue(connectionError);

      const candidate = new Candidate(candidateData);

      await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos');
    });
  });
});
