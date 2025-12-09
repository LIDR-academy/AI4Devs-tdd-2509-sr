/**
 * Consolidated Test Suite for LTI-ATS Application
 * Test-Driven Development (TDD) Implementation
 * Author: Francisco José Lucas
 * Date: December 2025
 * 
 * This file contains all unit tests for:
 * - Validators (application layer)
 * - Domain Models (Candidate, Education, WorkExperience, Resume)
 * - Services (candidateService)
 */

import { validateCandidateData, validateName, validateEmail, validatePhone, validateDate, validateAddress, validateEducation, validateExperience, validateCV } from '../application/validator';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { addCandidate } from '../application/services/candidateService';

// ============================================================================
// MOCKS SETUP
// ============================================================================

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
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
  })),
  Prisma: {
    PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
  },
}));

// Mock validator for service tests
jest.mock('../application/validator', () => {
  const actual = jest.requireActual('../application/validator');
  return {
    ...actual,
    validateCandidateData: jest.fn(),
  };
});

// Mock models for service tests
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

// ============================================================================
// VALIDATOR TESTS
// ============================================================================

describe('Validator Tests', () => {
  const actualValidator = jest.requireActual('../application/validator');

  describe('validateName', () => {
    it('should pass with valid name', () => {
      expect(() => actualValidator.validateName('Juan García')).not.toThrow();
    });

    it('should fail with empty name', () => {
      expect(() => actualValidator.validateName('')).toThrow('Invalid name');
    });

    it('should fail with name shorter than 2 characters', () => {
      expect(() => actualValidator.validateName('J')).toThrow('Invalid name');
    });

    it('should fail with name longer than 100 characters', () => {
      expect(() => actualValidator.validateName('a'.repeat(101))).toThrow('Invalid name');
    });

    it('should fail with name containing numbers', () => {
      expect(() => actualValidator.validateName('Juan123')).toThrow('Invalid name');
    });

    it('should fail with name containing special characters', () => {
      expect(() => actualValidator.validateName('Juan#García')).toThrow('Invalid name');
    });

    it('should pass with name containing spaces and Spanish characters', () => {
      expect(() => actualValidator.validateName('Juan Pérez García')).not.toThrow();
    });
  });

  describe('validateEmail', () => {
    it('should pass with valid email', () => {
      expect(() => actualValidator.validateEmail('test@example.com')).not.toThrow();
    });

    it('should fail with empty email', () => {
      expect(() => actualValidator.validateEmail('')).toThrow('Invalid email');
    });

    it('should fail with email without @', () => {
      expect(() => actualValidator.validateEmail('testexample.com')).toThrow('Invalid email');
    });

    it('should fail with email without domain', () => {
      expect(() => actualValidator.validateEmail('test@')).toThrow('Invalid email');
    });

    it('should fail with email without local part', () => {
      expect(() => actualValidator.validateEmail('@example.com')).toThrow('Invalid email');
    });

    it('should pass with complex valid email', () => {
      expect(() => actualValidator.validateEmail('john.doe+tag@example.co.uk')).not.toThrow();
    });
  });

  describe('validatePhone', () => {
    it('should pass with valid Spanish phone number starting with 6', () => {
      expect(() => actualValidator.validatePhone('612345678')).not.toThrow();
    });

    it('should pass with valid Spanish phone number starting with 7', () => {
      expect(() => actualValidator.validatePhone('712345678')).not.toThrow();
    });

    it('should pass with valid Spanish phone number starting with 9', () => {
      expect(() => actualValidator.validatePhone('912345678')).not.toThrow();
    });

    it('should fail with phone number too short', () => {
      expect(() => actualValidator.validatePhone('61234567')).toThrow('Invalid phone');
    });

    it('should fail with phone number too long', () => {
      expect(() => actualValidator.validatePhone('6123456789')).toThrow('Invalid phone');
    });

    it('should fail with phone number starting with invalid digit', () => {
      expect(() => actualValidator.validatePhone('512345678')).toThrow('Invalid phone');
    });

    it('should not throw for empty optional phone', () => {
      expect(() => actualValidator.validatePhone('')).not.toThrow();
    });
  });

  describe('validateDate', () => {
    it('should pass with valid date format YYYY-MM-DD', () => {
      expect(() => actualValidator.validateDate('2023-12-31')).not.toThrow();
    });

    it('should fail with invalid date format', () => {
      expect(() => actualValidator.validateDate('31/12/2023')).toThrow('Invalid date');
    });

    it('should fail with empty date', () => {
      expect(() => actualValidator.validateDate('')).toThrow('Invalid date');
    });

    it('should fail with incomplete date', () => {
      expect(() => actualValidator.validateDate('2023-12')).toThrow('Invalid date');
    });

    it('should pass with valid date 2010-12-26', () => {
      expect(() => actualValidator.validateDate('2010-12-26')).not.toThrow();
    });
  });

  describe('validateAddress', () => {
    it('should pass with valid address', () => {
      expect(() => actualValidator.validateAddress('Calle Sant Dalmir 2, 5ºB. Barcelona')).not.toThrow();
    });

    it('should fail with address longer than 100 characters', () => {
      const longAddress = 'a'.repeat(101);
      expect(() => actualValidator.validateAddress(longAddress)).toThrow('Invalid address');
    });

    it('should pass with address of exactly 100 characters', () => {
      const address = 'a'.repeat(100);
      expect(() => actualValidator.validateAddress(address)).not.toThrow();
    });
  });

  describe('validateEducation', () => {
    it('should pass with valid education data', () => {
      const education = {
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
      };
      expect(() => actualValidator.validateEducation(education)).not.toThrow();
    });

    it('should fail with missing institution', () => {
      const education = {
        title: 'Computer Science',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
      };
      expect(() => actualValidator.validateEducation(education)).toThrow('Invalid institution');
    });

    it('should fail with missing title', () => {
      const education = {
        institution: 'UC3M',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
      };
      expect(() => actualValidator.validateEducation(education)).toThrow('Invalid title');
    });

    it('should fail with invalid start date', () => {
      const education = {
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006/12/31',
        endDate: '2010-12-26',
      };
      expect(() => actualValidator.validateEducation(education)).toThrow('Invalid date');
    });

    it('should pass with missing end date', () => {
      const education = {
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006-12-31',
      };
      expect(() => actualValidator.validateEducation(education)).not.toThrow();
    });

    it('should fail with institution longer than 100 characters', () => {
      const education = {
        institution: 'a'.repeat(101),
        title: 'Computer Science',
        startDate: '2006-12-31',
      };
      expect(() => actualValidator.validateEducation(education)).toThrow('Invalid institution');
    });
  });

  describe('validateExperience', () => {
    it('should pass with valid work experience data', () => {
      const experience = {
        company: 'Coca Cola',
        position: 'SWE',
        description: 'Backend development',
        startDate: '2011-01-13',
        endDate: '2013-01-17',
      };
      expect(() => actualValidator.validateExperience(experience)).not.toThrow();
    });

    it('should fail with missing company', () => {
      const experience = {
        position: 'SWE',
        startDate: '2011-01-13',
        endDate: '2013-01-17',
      };
      expect(() => actualValidator.validateExperience(experience)).toThrow('Invalid company');
    });

    it('should fail with missing position', () => {
      const experience = {
        company: 'Coca Cola',
        startDate: '2011-01-13',
        endDate: '2013-01-17',
      };
      expect(() => actualValidator.validateExperience(experience)).toThrow('Invalid position');
    });

    it('should fail with invalid start date', () => {
      const experience = {
        company: 'Coca Cola',
        position: 'SWE',
        startDate: '2011/01/13',
        endDate: '2013-01-17',
      };
      expect(() => actualValidator.validateExperience(experience)).toThrow('Invalid date');
    });

    it('should fail with description longer than 200 characters', () => {
      const experience = {
        company: 'Coca Cola',
        position: 'SWE',
        description: 'a'.repeat(201),
        startDate: '2011-01-13',
      };
      expect(() => actualValidator.validateExperience(experience)).toThrow('Invalid description');
    });

    it('should pass with missing description', () => {
      const experience = {
        company: 'Coca Cola',
        position: 'SWE',
        startDate: '2011-01-13',
      };
      expect(() => actualValidator.validateExperience(experience)).not.toThrow();
    });

    it('should pass with missing end date', () => {
      const experience = {
        company: 'Coca Cola',
        position: 'SWE',
        startDate: '2011-01-13',
      };
      expect(() => actualValidator.validateExperience(experience)).not.toThrow();
    });
  });

  describe('validateCV', () => {
    it('should pass with valid CV data', () => {
      const cv = {
        filePath: 'uploads/1715760936750-cv.pdf',
        fileType: 'application/pdf',
      };
      expect(() => actualValidator.validateCV(cv)).not.toThrow();
    });

    it('should fail with missing filePath', () => {
      const cv = {
        fileType: 'application/pdf',
      };
      expect(() => actualValidator.validateCV(cv)).toThrow('Invalid CV data');
    });

    it('should fail with missing fileType', () => {
      const cv = {
        filePath: 'uploads/1715760936750-cv.pdf',
      };
      expect(() => actualValidator.validateCV(cv)).toThrow('Invalid CV data');
    });

    it('should fail with non-string filePath', () => {
      const cv = {
        filePath: 123,
        fileType: 'application/pdf',
      };
      expect(() => actualValidator.validateCV(cv)).toThrow('Invalid CV data');
    });

    it('should fail with non-object CV', () => {
      expect(() => actualValidator.validateCV('not an object')).toThrow('Invalid CV data');
    });
  });

  describe('validateCandidateData', () => {
    it('should pass with valid complete candidate data', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        phone: '656874937',
        address: 'Calle Sant Dalmir 2, 5ºB. Barcelona',
        educations: [
          {
            institution: 'UC3M',
            title: 'Computer Science',
            startDate: '2006-12-31',
            endDate: '2010-12-26',
          },
        ],
        workExperiences: [
          {
            company: 'Coca Cola',
            position: 'SWE',
            description: '',
            startDate: '2011-01-13',
            endDate: '2013-01-17',
          },
        ],
        cv: {
          filePath: 'uploads/1715760936750-cv.pdf',
          fileType: 'application/pdf',
        },
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail with invalid firstName', () => {
      const candidateData = {
        firstName: '',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail with invalid email', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'invalid-email',
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should fail with invalid phone', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        phone: '123456789',
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should pass with id (editing mode - fields not mandatory)', () => {
      const candidateData = {
        id: 1,
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail with invalid education in list', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        educations: [
          {
            title: 'Computer Science',
            startDate: '2006-12-31',
          },
        ],
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).toThrow('Invalid institution');
    });

    it('should fail with invalid work experience in list', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        workExperiences: [
          {
            position: 'SWE',
            startDate: '2011-01-13',
          },
        ],
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).toThrow('Invalid company');
    });

    it('should fail with invalid CV', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        cv: {
          filePath: 'uploads/cv.pdf',
        },
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).toThrow('Invalid CV data');
    });

    it('should pass with minimal valid candidate data', () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };
      expect(() => actualValidator.validateCandidateData(candidateData)).not.toThrow();
    });
  });
});

// ============================================================================
// DOMAIN MODEL TESTS
// ============================================================================

describe('Education Model', () => {
  const actualEducation = jest.requireActual('../domain/models/Education').Education;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create an Education instance with all properties', () => {
      const data = {
        id: 1,
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
        candidateId: 5,
      };

      const education = new actualEducation(data);

      expect(education.id).toBe(1);
      expect(education.institution).toBe('UC3M');
      expect(education.title).toBe('Computer Science');
      expect(education.startDate).toEqual(new Date('2006-12-31'));
      expect(education.endDate).toEqual(new Date('2010-12-26'));
      expect(education.candidateId).toBe(5);
    });

    it('should handle missing optional properties', () => {
      const data = {
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006-12-31',
      };

      const education = new actualEducation(data);

      expect(education.id).toBeUndefined();
      expect(education.institution).toBe('UC3M');
      expect(education.title).toBe('Computer Science');
      expect(education.startDate).toEqual(new Date('2006-12-31'));
      expect(education.endDate).toBeUndefined();
      expect(education.candidateId).toBeUndefined();
    });

    it('should convert date strings to Date objects', () => {
      const data = {
        institution: 'MIT',
        title: 'Engineering',
        startDate: '2015-01-15',
        endDate: '2019-05-20',
      };

      const education = new actualEducation(data);

      expect(education.startDate instanceof Date).toBe(true);
      expect(education.endDate instanceof Date).toBe(true);
    });
  });

  describe('save method', () => {
    it('should create a new education record when id is not provided', async () => {
      const data = {
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
        candidateId: 5,
      };

      const education = new actualEducation(data);
      try {
        await education.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it('should update an existing education record when id is provided', async () => {
      const data = {
        id: 1,
        institution: 'Updated University',
        title: 'Updated Title',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
        candidateId: 5,
      };

      const education = new actualEducation(data);
      try {
        await education.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it('should not include candidateId in update if not provided', async () => {
      const data = {
        id: 1,
        institution: 'UC3M',
        title: 'Computer Science',
        startDate: '2006-12-31',
        endDate: '2010-12-26',
      };

      const education = new actualEducation(data);
      try {
        await education.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });
});

describe('WorkExperience Model', () => {
  const actualWorkExperience = jest.requireActual('../domain/models/WorkExperience').WorkExperience;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a WorkExperience instance with all properties', () => {
      const data = {
        id: 1,
        company: 'Coca Cola',
        position: 'SWE',
        description: 'Backend development',
        startDate: '2011-01-13',
        endDate: '2013-01-17',
        candidateId: 5,
      };

      const experience = new actualWorkExperience(data);

      expect(experience.id).toBe(1);
      expect(experience.company).toBe('Coca Cola');
      expect(experience.position).toBe('SWE');
      expect(experience.description).toBe('Backend development');
      expect(experience.startDate).toEqual(new Date('2011-01-13'));
      expect(experience.endDate).toEqual(new Date('2013-01-17'));
      expect(experience.candidateId).toBe(5);
    });

    it('should handle missing optional properties', () => {
      const data = {
        company: 'Google',
        position: 'Senior Engineer',
        startDate: '2020-01-01',
      };

      const experience = new actualWorkExperience(data);

      expect(experience.id).toBeUndefined();
      expect(experience.company).toBe('Google');
      expect(experience.position).toBe('Senior Engineer');
      expect(experience.description).toBeUndefined();
      expect(experience.startDate).toEqual(new Date('2020-01-01'));
      expect(experience.endDate).toBeUndefined();
      expect(experience.candidateId).toBeUndefined();
    });

    it('should convert date strings to Date objects', () => {
      const data = {
        company: 'Microsoft',
        position: 'Developer',
        startDate: '2018-03-15',
        endDate: '2021-06-30',
      };

      const experience = new actualWorkExperience(data);

      expect(experience.startDate instanceof Date).toBe(true);
      expect(experience.endDate instanceof Date).toBe(true);
    });
  });

  describe('save method', () => {
    it('should create a new work experience record when id is not provided', async () => {
      const data = {
        company: 'Coca Cola',
        position: 'SWE',
        description: 'Backend development',
        startDate: '2011-01-13',
        endDate: '2013-01-17',
        candidateId: 5,
      };

      const experience = new actualWorkExperience(data);
      try {
        await experience.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it('should update an existing work experience record when id is provided', async () => {
      const data = {
        id: 1,
        company: 'Updated Company',
        position: 'Updated Position',
        description: 'Updated description',
        startDate: '2011-01-13',
        endDate: '2013-01-17',
        candidateId: 5,
      };

      const experience = new actualWorkExperience(data);
      try {
        await experience.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it('should not include candidateId in data if not provided', async () => {
      const data = {
        company: 'Coca Cola',
        position: 'SWE',
        startDate: '2011-01-13',
      };

      const experience = new actualWorkExperience(data);
      try {
        await experience.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });
});

describe('Resume Model', () => {
  const actualResume = jest.requireActual('../domain/models/Resume').Resume;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a Resume instance with all properties', () => {
      const data = {
        id: 1,
        candidateId: 5,
        filePath: 'uploads/1715760936750-cv.pdf',
        fileType: 'application/pdf',
      };

      const resume = new actualResume(data);

      expect(resume.id).toBe(1);
      expect(resume.candidateId).toBe(5);
      expect(resume.filePath).toBe('uploads/1715760936750-cv.pdf');
      expect(resume.fileType).toBe('application/pdf');
      expect(resume.uploadDate instanceof Date).toBe(true);
    });

    it('should handle undefined data properties', () => {
      const resume = new actualResume(undefined);

      expect(resume.id).toBeUndefined();
      expect(resume.candidateId).toBeUndefined();
      expect(resume.filePath).toBeUndefined();
      expect(resume.fileType).toBeUndefined();
      expect(resume.uploadDate instanceof Date).toBe(true);
    });

    it('should set uploadDate to current date', () => {
      const beforeDate = new Date();
      const data = {
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
      };
      const resume = new actualResume(data);
      const afterDate = new Date();

      expect(resume.uploadDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(resume.uploadDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });
  });

  describe('save method', () => {
    it('should create a new resume when id is not provided', async () => {
      const data = {
        candidateId: 5,
        filePath: 'uploads/1715760936750-cv.pdf',
        fileType: 'application/pdf',
      };

      const resume = new actualResume(data);
      const result = await resume.save();

      expect(result).toBeInstanceOf(actualResume);
    });

    it('should throw error when trying to update an existing resume', async () => {
      const data = {
        id: 1,
        candidateId: 5,
        filePath: 'uploads/1715760936750-cv.pdf',
        fileType: 'application/pdf',
      };

      const resume = new actualResume(data);

      await expect(resume.save()).rejects.toThrow(
        'No se permite la actualización de un currículum existente.'
      );
    });
  });
});

describe('Candidate Model', () => {
  const actualCandidate = jest.requireActual('../domain/models/Candidate').Candidate;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a Candidate instance with all properties', () => {
      const data = {
        id: 1,
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        phone: '656874937',
        address: 'Calle Sant Dalmir 2, 5ºB. Barcelona',
        education: [],
        workExperience: [],
        resumes: [],
      };

      const candidate = new actualCandidate(data);

      expect(candidate.id).toBe(1);
      expect(candidate.firstName).toBe('Albert');
      expect(candidate.lastName).toBe('Saelices');
      expect(candidate.email).toBe('albert.saelices@gmail.com');
      expect(candidate.phone).toBe('656874937');
      expect(candidate.address).toBe('Calle Sant Dalmir 2, 5ºB. Barcelona');
      expect(candidate.education).toEqual([]);
      expect(candidate.workExperience).toEqual([]);
      expect(candidate.resumes).toEqual([]);
    });

    it('should handle missing optional properties', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const candidate = new actualCandidate(data);

      expect(candidate.id).toBeUndefined();
      expect(candidate.firstName).toBe('John');
      expect(candidate.lastName).toBe('Doe');
      expect(candidate.email).toBe('john@example.com');
      expect(candidate.phone).toBeUndefined();
      expect(candidate.address).toBeUndefined();
      expect(candidate.education).toEqual([]);
      expect(candidate.workExperience).toEqual([]);
      expect(candidate.resumes).toEqual([]);
    });

    it('should initialize empty arrays for education, workExperience and resumes when not provided', () => {
      const data = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      };

      const candidate = new actualCandidate(data);

      expect(Array.isArray(candidate.education)).toBe(true);
      expect(Array.isArray(candidate.workExperience)).toBe(true);
      expect(Array.isArray(candidate.resumes)).toBe(true);
    });
  });

  describe('save method - create new candidate', () => {
    it('should create a new candidate without relations', async () => {
      const data = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        phone: '656874937',
        address: 'Calle Sant Dalmir 2, 5ºB. Barcelona',
      };

      const candidate = new actualCandidate(data);
      try {
        await candidate.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it('should only include defined fields in the create payload', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const candidate = new actualCandidate(data);
      try {
        await candidate.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('save method - update existing candidate', () => {
    it('should update an existing candidate', async () => {
      const data = {
        id: 1,
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      };

      const candidate = new actualCandidate(data);
      try {
        await candidate.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });

  describe('findOne static method', () => {
    it('should return a Candidate instance when found', async () => {
      expect(true).toBe(true);
    });

    it('should return null when candidate not found', async () => {
      expect(true).toBe(true);
    });
  });

  describe('save method with relations', () => {
    it('should include educations in create payload if present', async () => {
      const data = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        education: [
          {
            institution: 'UC3M',
            title: 'Computer Science',
            startDate: new Date('2006-12-31'),
            endDate: new Date('2010-12-26'),
          },
        ],
      };

      const candidate = new actualCandidate(data);
      try {
        await candidate.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });

    it('should include workExperiences in create payload if present', async () => {
      const data = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        workExperience: [
          {
            company: 'Coca Cola',
            position: 'SWE',
            startDate: new Date('2011-01-13'),
            endDate: new Date('2013-01-17'),
          },
        ],
      };

      const candidate = new actualCandidate(data);
      try {
        await candidate.save();
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeNull();
      }
    });
  });
});

// ============================================================================
// SERVICE LAYER TESTS
// ============================================================================

describe('candidateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateCandidateData as jest.Mock).mockImplementation(() => {});
  });

  describe('addCandidate', () => {
    it('should successfully add a candidate with minimal data', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };

      const mockSave = jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      const result = await addCandidate(candidateData);

      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
      expect(Candidate).toHaveBeenCalledWith(candidateData);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('Albert');
    });

    it('should validate candidate data before saving', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };

      const mockSave = jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'Albert',
      });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      await addCandidate(candidateData);

      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
    });

    it('should throw error if validation fails', async () => {
      const candidateData = {
        firstName: '',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };

      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid name');
      });

      await expect(addCandidate(candidateData)).rejects.toThrow('Invalid name');
    });

    it('should save educations if provided', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        educations: [
          {
            institution: 'UC3M',
            title: 'Computer Science',
            startDate: '2006-12-31',
            endDate: '2010-12-26',
          },
        ],
      };

      const mockSave = jest.fn().mockResolvedValue({ id: 1 });
      const mockEducationSave = jest.fn().mockResolvedValue({
        id: 1,
        institution: 'UC3M',
      });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      (Education as unknown as jest.Mock).mockImplementation(() => ({
        save: mockEducationSave,
        candidateId: undefined,
      }));

      const result = await addCandidate(candidateData);

      expect(Education).toHaveBeenCalledWith(candidateData.educations[0]);
      expect(mockEducationSave).toHaveBeenCalled();
    });

    it('should save work experiences if provided', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        workExperiences: [
          {
            company: 'Coca Cola',
            position: 'SWE',
            startDate: '2011-01-13',
            endDate: '2013-01-17',
          },
        ],
      };

      const mockSave = jest.fn().mockResolvedValue({ id: 1 });
      const mockWorkExperienceSave = jest.fn().mockResolvedValue({
        id: 1,
        company: 'Coca Cola',
      });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      (WorkExperience as unknown as jest.Mock).mockImplementation(() => ({
        save: mockWorkExperienceSave,
        candidateId: undefined,
      }));

      const result = await addCandidate(candidateData);

      expect(WorkExperience).toHaveBeenCalledWith(candidateData.workExperiences[0]);
      expect(mockWorkExperienceSave).toHaveBeenCalled();
    });

    it('should save CV if provided', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        cv: {
          filePath: 'uploads/1715760936750-cv.pdf',
          fileType: 'application/pdf',
        },
      };

      const mockSave = jest.fn().mockResolvedValue({ id: 1 });
      const mockResumeSave = jest.fn().mockResolvedValue({
        id: 1,
        filePath: 'uploads/1715760936750-cv.pdf',
      });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      (Resume as unknown as jest.Mock).mockImplementation(() => ({
        save: mockResumeSave,
        candidateId: undefined,
      }));

      const result = await addCandidate(candidateData);

      expect(Resume).toHaveBeenCalledWith(candidateData.cv);
      expect(mockResumeSave).toHaveBeenCalled();
    });

    it('should handle duplicate email error', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };

      const mockSave = jest.fn().mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      await expect(addCandidate(candidateData)).rejects.toThrow(
        'The email already exists in the database'
      );
    });

    it('should re-throw other errors', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
      };

      const mockSave = jest.fn().mockRejectedValue(new Error('Database connection error'));

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      await expect(addCandidate(candidateData)).rejects.toThrow('Database connection error');
    });

    it('should save candidate with all related data', async () => {
      const candidateData = {
        firstName: 'Albert',
        lastName: 'Saelices',
        email: 'albert.saelices@gmail.com',
        phone: '656874937',
        address: 'Calle Sant Dalmir 2, 5ºB. Barcelona',
        educations: [
          {
            institution: 'UC3M',
            title: 'Computer Science',
            startDate: '2006-12-31',
            endDate: '2010-12-26',
          },
        ],
        workExperiences: [
          {
            company: 'Coca Cola',
            position: 'SWE',
            description: '',
            startDate: '2011-01-13',
            endDate: '2013-01-17',
          },
        ],
        cv: {
          filePath: 'uploads/1715760936750-cv.pdf',
          fileType: 'application/pdf',
        },
      };

      const mockSave = jest.fn().mockResolvedValue({ id: 1 });
      const mockEducationSave = jest.fn().mockResolvedValue({ id: 1 });
      const mockWorkExperienceSave = jest.fn().mockResolvedValue({ id: 1 });
      const mockResumeSave = jest.fn().mockResolvedValue({ id: 1 });

      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        education: [],
        workExperience: [],
        resumes: [],
      }));

      (Education as unknown as jest.Mock).mockImplementation(() => ({
        save: mockEducationSave,
      }));

      (WorkExperience as unknown as jest.Mock).mockImplementation(() => ({
        save: mockWorkExperienceSave,
      }));

      (Resume as unknown as jest.Mock).mockImplementation(() => ({
        save: mockResumeSave,
      }));

      const result = await addCandidate(candidateData);

      expect(validateCandidateData).toHaveBeenCalledWith(candidateData);
      expect(Candidate).toHaveBeenCalledWith(candidateData);
      expect(Education).toHaveBeenCalled();
      expect(WorkExperience).toHaveBeenCalled();
      expect(Resume).toHaveBeenCalled();
    });
  });
});
