// Tests for candidate insertion functionality
// Activity 2: AI4Devs TDD Exercise

import { validateCandidateData } from '../application/validator';

// Create mock functions that persist across tests
const mockCandidateCreate = jest.fn();
const mockCandidateUpdate = jest.fn();
const mockCandidateFindUnique = jest.fn();
const mockEducationCreate = jest.fn();
const mockWorkExperienceCreate = jest.fn();
const mockResumeCreate = jest.fn();

// Mock the Prisma client module before importing candidateService
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      candidate: {
        create: mockCandidateCreate,
        update: mockCandidateUpdate,
        findUnique: mockCandidateFindUnique,
      },
      education: {
        create: mockEducationCreate,
      },
      workExperience: {
        create: mockWorkExperienceCreate,
      },
      resume: {
        create: mockResumeCreate,
      },
    })),
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

// Import after mocking
import { addCandidate } from '../application/services/candidateService';

describe('Candidate Data Validation', () => {
  // Helper function to create valid candidate data
  const createValidCandidate = (overrides = {}) => ({
    firstName: 'Juan',
    lastName: 'García',
    email: 'juan.garcia@example.com',
    phone: '612345678',
    address: 'Calle Mayor 123, Madrid',
    ...overrides,
  });

  describe('Valid Candidate Data', () => {
    it('should pass validation with all valid required fields', () => {
      const candidateData = createValidCandidate();
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with valid candidate including education', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with valid candidate including work experience', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Software Developer',
            description: 'Desarrollo de aplicaciones web',
            startDate: '2022-07-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should skip validation when editing existing candidate (id provided)', () => {
      const candidateData = {
        id: 1,
        firstName: '', // Invalid but should be skipped
        lastName: '',
        email: 'invalid',
      };
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });

  describe('firstName Validation', () => {
    it('should fail validation when firstName is empty', () => {
      const candidateData = createValidCandidate({ firstName: '' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail validation when firstName is null', () => {
      const candidateData = createValidCandidate({ firstName: null });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail validation when firstName is undefined', () => {
      const candidateData = createValidCandidate({ firstName: undefined });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail validation when firstName is too short (1 character)', () => {
      const candidateData = createValidCandidate({ firstName: 'J' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should pass validation when firstName has exactly 2 characters', () => {
      const candidateData = createValidCandidate({ firstName: 'Jo' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when firstName contains invalid characters (numbers)', () => {
      const candidateData = createValidCandidate({ firstName: 'Juan123' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail validation when firstName contains invalid characters (special chars)', () => {
      const candidateData = createValidCandidate({ firstName: 'Juan@García' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should pass validation when firstName contains Spanish characters', () => {
      const candidateData = createValidCandidate({ firstName: 'José María Ñoño' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when firstName contains accented characters', () => {
      const candidateData = createValidCandidate({ firstName: 'María Ángela' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when firstName is too long (over 100 characters)', () => {
      const candidateData = createValidCandidate({ firstName: 'A'.repeat(101) });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should pass validation when firstName has exactly 100 characters', () => {
      const candidateData = createValidCandidate({ firstName: 'A'.repeat(100) });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });

  describe('lastName Validation', () => {
    it('should fail validation when lastName is empty', () => {
      const candidateData = createValidCandidate({ lastName: '' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail validation when lastName is null', () => {
      const candidateData = createValidCandidate({ lastName: null });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should fail validation when lastName is too short (1 character)', () => {
      const candidateData = createValidCandidate({ lastName: 'G' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should pass validation when lastName has exactly 2 characters', () => {
      const candidateData = createValidCandidate({ lastName: 'Gi' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when lastName contains invalid characters', () => {
      const candidateData = createValidCandidate({ lastName: 'García-López' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });

    it('should pass validation when lastName contains Spanish characters', () => {
      const candidateData = createValidCandidate({ lastName: 'García Muñoz' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when lastName is too long (over 100 characters)', () => {
      const candidateData = createValidCandidate({ lastName: 'B'.repeat(101) });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
    });
  });

  describe('email Validation', () => {
    it('should fail validation when email is empty', () => {
      const candidateData = createValidCandidate({ email: '' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should fail validation when email is null', () => {
      const candidateData = createValidCandidate({ email: null });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should fail validation when email has invalid format (missing @)', () => {
      const candidateData = createValidCandidate({ email: 'juangarciaexample.com' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should fail validation when email has invalid format (missing domain)', () => {
      const candidateData = createValidCandidate({ email: 'juan@' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should fail validation when email has invalid format (missing TLD)', () => {
      const candidateData = createValidCandidate({ email: 'juan@example' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should fail validation when email has invalid format (short TLD)', () => {
      const candidateData = createValidCandidate({ email: 'juan@example.c' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
    });

    it('should pass validation with valid email format', () => {
      const candidateData = createValidCandidate({ email: 'test.user+tag@subdomain.example.com' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with email containing numbers', () => {
      const candidateData = createValidCandidate({ email: 'user123@example.com' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });

  describe('phone Validation', () => {
    it('should pass validation when phone is not provided (optional)', () => {
      const candidateData = createValidCandidate({ phone: undefined });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when phone is empty string (optional)', () => {
      const candidateData = createValidCandidate({ phone: '' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when phone has invalid format (non-Spanish)', () => {
      const candidateData = createValidCandidate({ phone: '1234567890' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should fail validation when phone has invalid format (too short)', () => {
      const candidateData = createValidCandidate({ phone: '61234567' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should fail validation when phone has invalid format (too long)', () => {
      const candidateData = createValidCandidate({ phone: '6123456789' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should fail validation when phone starts with invalid digit', () => {
      const candidateData = createValidCandidate({ phone: '512345678' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should pass validation with valid Spanish mobile number starting with 6', () => {
      const candidateData = createValidCandidate({ phone: '612345678' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with valid Spanish mobile number starting with 7', () => {
      const candidateData = createValidCandidate({ phone: '712345678' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with valid Spanish landline number starting with 9', () => {
      const candidateData = createValidCandidate({ phone: '912345678' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when phone contains non-numeric characters', () => {
      const candidateData = createValidCandidate({ phone: '6123-4567' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should fail validation when phone contains spaces', () => {
      const candidateData = createValidCandidate({ phone: '612 345 678' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });

    it('should fail validation when phone has country prefix', () => {
      const candidateData = createValidCandidate({ phone: '+34612345678' });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
    });
  });

  describe('address Validation', () => {
    it('should pass validation when address is not provided (optional)', () => {
      const candidateData = createValidCandidate({ address: undefined });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when address is empty string', () => {
      const candidateData = createValidCandidate({ address: '' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when address has valid length', () => {
      const candidateData = createValidCandidate({ address: 'Calle Mayor 123, 28001 Madrid' });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when address has exactly 100 characters', () => {
      const candidateData = createValidCandidate({ address: 'A'.repeat(100) });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when address is too long (over 100 characters)', () => {
      const candidateData = createValidCandidate({ address: 'A'.repeat(101) });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid address');
    });
  });

  describe('education Validation', () => {
    it('should pass validation when educations is not provided', () => {
      const candidateData = createValidCandidate({ educations: undefined });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when educations is empty array', () => {
      const candidateData = createValidCandidate({ educations: [] });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when education institution is missing', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            title: 'Ingeniería',
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
    });

    it('should fail validation when education institution is empty', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: '',
            title: 'Ingeniería',
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
    });

    it('should fail validation when education institution is too long', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'A'.repeat(101),
            title: 'Ingeniería',
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
    });

    it('should fail validation when education title is missing', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid title');
    });

    it('should fail validation when education title is empty', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            title: '',
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid title');
    });

    it('should fail validation when education title is too long', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            title: 'T'.repeat(101),
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid title');
    });

    it('should fail validation when education startDate is missing', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            title: 'Ingeniería',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
    });

    it('should fail validation when education startDate has invalid format', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            title: 'Ingeniería',
            startDate: '01-09-2018',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
    });

    it('should fail validation when education endDate has invalid format', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            title: 'Ingeniería',
            startDate: '2018-09-01',
            endDate: '30/06/2022',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid end date');
    });

    it('should pass validation when education endDate is not provided (ongoing)', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad',
            title: 'Ingeniería',
            startDate: '2018-09-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with multiple valid educations', () => {
      const candidateData = createValidCandidate({
        educations: [
          {
            institution: 'Universidad A',
            title: 'Grado A',
            startDate: '2014-09-01',
            endDate: '2018-06-30',
          },
          {
            institution: 'Universidad B',
            title: 'Máster B',
            startDate: '2018-09-01',
            endDate: '2019-06-30',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });

  describe('workExperience Validation', () => {
    it('should pass validation when workExperiences is not provided', () => {
      const candidateData = createValidCandidate({ workExperiences: undefined });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when workExperiences is empty array', () => {
      const candidateData = createValidCandidate({ workExperiences: [] });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when experience company is missing', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            position: 'Developer',
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid company');
    });

    it('should fail validation when experience company is empty', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: '',
            position: 'Developer',
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid company');
    });

    it('should fail validation when experience company is too long', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'C'.repeat(101),
            position: 'Developer',
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid company');
    });

    it('should fail validation when experience position is missing', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid position');
    });

    it('should fail validation when experience position is empty', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: '',
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid position');
    });

    it('should fail validation when experience position is too long', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'P'.repeat(101),
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid position');
    });

    it('should fail validation when experience description is too long', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            description: 'D'.repeat(201),
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid description');
    });

    it('should pass validation when experience description has exactly 200 characters', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            description: 'D'.repeat(200),
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when experience startDate is missing', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Developer',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
    });

    it('should fail validation when experience startDate has invalid format', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: '2020/01/01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid date');
    });

    it('should fail validation when experience endDate has invalid format', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: '2020-01-01',
            endDate: 'January 2022',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid end date');
    });

    it('should pass validation when experience endDate is not provided (current job)', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: '2020-01-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation with multiple valid work experiences', () => {
      const candidateData = createValidCandidate({
        workExperiences: [
          {
            company: 'Company A',
            position: 'Junior Dev',
            startDate: '2018-01-01',
            endDate: '2020-01-01',
          },
          {
            company: 'Company B',
            position: 'Senior Dev',
            description: 'Lead developer role',
            startDate: '2020-02-01',
          },
        ],
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });

  describe('CV Validation', () => {
    it('should pass validation when cv is not provided', () => {
      const candidateData = createValidCandidate({ cv: undefined });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should pass validation when cv is empty object', () => {
      const candidateData = createValidCandidate({ cv: {} });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });

    it('should fail validation when cv is missing filePath', () => {
      const candidateData = createValidCandidate({
        cv: {
          fileType: 'application/pdf',
        },
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
    });

    it('should fail validation when cv is missing fileType', () => {
      const candidateData = createValidCandidate({
        cv: {
          filePath: '/uploads/cv.pdf',
        },
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
    });

    it('should fail validation when cv filePath is not a string', () => {
      const candidateData = createValidCandidate({
        cv: {
          filePath: 123,
          fileType: 'application/pdf',
        },
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
    });

    it('should fail validation when cv fileType is not a string', () => {
      const candidateData = createValidCandidate({
        cv: {
          filePath: '/uploads/cv.pdf',
          fileType: 123,
        },
      });
      expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
    });

    it('should pass validation with valid cv data', () => {
      const candidateData = createValidCandidate({
        cv: {
          filePath: '/uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      });
      expect(() => validateCandidateData(candidateData)).not.toThrow();
    });
  });
});

// Database operation tests
describe('Candidate Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create valid candidate data for database tests
  const createValidCandidateData = (overrides = {}) => ({
    firstName: 'Juan',
    lastName: 'García',
    email: 'juan.garcia@example.com',
    phone: '612345678',
    address: 'Calle Mayor 123, Madrid',
    ...overrides,
  });

  describe('Successful Candidate Creation', () => {
    it('should successfully create and save a new candidate', async () => {
      const candidateData = createValidCandidateData();
      const savedCandidate = {
        id: 1,
        ...candidateData,
      };

      // Mock the create method
      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.firstName).toBe(candidateData.firstName);
      expect(result.email).toBe(candidateData.email);
    });

    it('should save candidate with education records', async () => {
      const candidateData = createValidCandidateData({
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30',
          },
        ],
      });

      const savedCandidate = {
        id: 1,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        address: candidateData.address,
      };

      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should save candidate with work experience records', async () => {
      const candidateData = createValidCandidateData({
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Software Developer',
            description: 'Desarrollo de aplicaciones web',
            startDate: '2022-07-01',
          },
        ],
      });

      const savedCandidate = {
        id: 1,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        address: candidateData.address,
      };

      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should save candidate with CV data', async () => {
      const candidateData = createValidCandidateData({
        cv: {
          filePath: '/uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      });

      const savedCandidate = {
        id: 1,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        address: candidateData.address,
      };

      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe('Duplicate Email Handling (P2002 Error)', () => {
    it('should return error when email already exists in database', async () => {
      const candidateData = createValidCandidateData();

      // Simulate Prisma P2002 unique constraint error
      const prismaError = new Error('Unique constraint failed') as any;
      prismaError.code = 'P2002';

      mockCandidateCreate.mockRejectedValue(prismaError);

      await expect(addCandidate(candidateData)).rejects.toThrow(
        'The email already exists in the database'
      );
    });

    it('should handle duplicate email with different case', async () => {
      const candidateData = createValidCandidateData({
        email: 'JUAN.GARCIA@EXAMPLE.COM',
      });

      const prismaError = new Error('Unique constraint failed') as any;
      prismaError.code = 'P2002';

      mockCandidateCreate.mockRejectedValue(prismaError);

      await expect(addCandidate(candidateData)).rejects.toThrow(
        'The email already exists in the database'
      );
    });
  });

  describe('Database Connection Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const candidateData = createValidCandidateData();

      // Simulate a database connection error using a custom error class
      const connectionError = Object.assign(new Error('Unable to connect to database'), {
        name: 'PrismaClientInitializationError',
      });

      mockCandidateCreate.mockRejectedValue(connectionError);

      await expect(addCandidate(candidateData)).rejects.toThrow();
    });

    it('should propagate unknown database errors', async () => {
      const candidateData = createValidCandidateData();

      // Simulate a generic database error
      const genericError = new Error('Unknown database error');

      mockCandidateCreate.mockRejectedValue(genericError);

      await expect(addCandidate(candidateData)).rejects.toThrow('Unknown database error');
    });
  });

  describe('Candidate Creation with Related Data', () => {
    it('should save candidate with multiple education records', async () => {
      const candidateData = createValidCandidateData({
        educations: [
          {
            institution: 'Universidad A',
            title: 'Grado en Informática',
            startDate: '2014-09-01',
            endDate: '2018-06-30',
          },
          {
            institution: 'Universidad B',
            title: 'Máster en Data Science',
            startDate: '2018-09-01',
            endDate: '2019-06-30',
          },
        ],
      });

      const savedCandidate = {
        id: 1,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        address: candidateData.address,
      };

      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should save candidate with multiple work experiences', async () => {
      const candidateData = createValidCandidateData({
        workExperiences: [
          {
            company: 'Company A',
            position: 'Junior Developer',
            startDate: '2018-07-01',
            endDate: '2020-06-30',
          },
          {
            company: 'Company B',
            position: 'Senior Developer',
            description: 'Team lead',
            startDate: '2020-07-01',
          },
        ],
      });

      const savedCandidate = {
        id: 1,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        address: candidateData.address,
      };

      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should save complete candidate profile with all related data', async () => {
      const candidateData = createValidCandidateData({
        educations: [
          {
            institution: 'Universidad Complutense',
            title: 'Ingeniería Informática',
            startDate: '2018-09-01',
            endDate: '2022-06-30',
          },
        ],
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Software Developer',
            startDate: '2022-07-01',
          },
        ],
        cv: {
          filePath: '/uploads/cv.pdf',
          fileType: 'application/pdf',
        },
      });

      const savedCandidate = {
        id: 1,
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        address: candidateData.address,
      };

      mockCandidateCreate.mockResolvedValue(savedCandidate);

      const result = await addCandidate(candidateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe('Validation Errors Before Database Save', () => {
    it('should reject candidate with invalid data before reaching database', async () => {
      const invalidCandidateData = {
        firstName: '', // Invalid: empty
        lastName: 'García',
        email: 'juan@example.com',
      };

      await expect(addCandidate(invalidCandidateData)).rejects.toThrow('Invalid name');

      // Verify database was never called
      expect(mockCandidateCreate).not.toHaveBeenCalled();
    });

    it('should reject candidate with invalid email before reaching database', async () => {
      const invalidCandidateData = createValidCandidateData({
        email: 'invalid-email',
      });

      await expect(addCandidate(invalidCandidateData)).rejects.toThrow('Invalid email');

      // Verify database was never called
      expect(mockCandidateCreate).not.toHaveBeenCalled();
    });
  });
});
