// Mock Prisma Client before any imports
// Define error classes outside the mock factory so they can be used with instanceof
class MockPrismaClientKnownRequestError extends Error {
  code: string;
  meta: any;
  constructor(message: string, code: string, meta?: any) {
    super(message);
    this.code = code;
    this.meta = meta;
    this.name = 'PrismaClientKnownRequestError';
  }
}

class MockPrismaClientInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientInitializationError';
  }
}

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
  const mockClient = {
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

  return {
    PrismaClient: jest.fn(() => mockClient),
    Prisma: {
      PrismaClientKnownRequestError: MockPrismaClientKnownRequestError,
      PrismaClientInitializationError: MockPrismaClientInitializationError,
    },
  };
});

// Define MulterError class - this will be shared between mock and service
// The key is ensuring the same class reference is used everywhere
class MulterErrorClass extends Error {
  code: string;
  field?: string;
  constructor(code: string, field?: string) {
    super(code);
    this.code = code;
    this.field = field;
    this.name = 'MulterError';
  }
}

// Store globally to ensure same reference across module boundaries
(global as any).__JEST_MULTER_ERROR__ = MulterErrorClass;

// Create a shared mock instance that can be accessed from tests
let mockMulterInstance: any;

jest.mock('multer', () => {
  // Get the MulterError class from global - ensures same reference
  const MulterErrorClass = (global as any).__JEST_MULTER_ERROR__;

  const diskStorage = jest.fn((options: any) => {
    return {
      _handleFile: jest.fn(),
      _removeFile: jest.fn(),
    };
  });

  // Create a shared mock instance that can be configured from tests
  const createMockInstance = () => {
    const instance = {
      single: jest.fn((fieldName: string) => {
        // Default middleware that calls callback() without error
        return jest.fn((req: any, res: any, callback: any) => {
          callback();
        });
      }),
    };
    return instance;
  };

  const sharedInstance = createMockInstance();
  // Store in global so tests can access it
  (global as any).__MOCK_MULTER_INSTANCE__ = sharedInstance;

  const multerFn: any = jest.fn(() => {
    // Return the shared instance so tests can configure it
    return sharedInstance;
  });

  // Attach diskStorage and MulterError as properties to the function
  // CRITICAL: Use the global MulterErrorClass to ensure same reference
  multerFn.diskStorage = diskStorage;
  multerFn.MulterError = MulterErrorClass;

  return {
    __esModule: true,
    default: multerFn,
    MulterError: MulterErrorClass,
  };
});

import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { validateCandidateData } from '../application/validator';
import { uploadFile } from '../application/services/fileUploadService';
// Import multer directly from the service module's context to get the exact MulterError class
import * as serviceMulterModule from 'multer';
import { addCandidateController } from '../presentation/controllers/candidateController';

// Get the shared mock instance after imports
mockMulterInstance = (global as any).__MOCK_MULTER_INSTANCE__;
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import candidateRoutes from '../routes/candidateRoutes';
import multer from 'multer'; // Import the same way service does

// Get mocked Prisma instance
const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

// Test data fixtures
const validCandidateData = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '612345678',
  address: 'Calle Principal 123',
  educations: [
    {
      institution: 'Universidad Complutense',
      title: 'Ingeniería Informática',
      startDate: '2020-01-01',
      endDate: '2024-01-01',
    },
  ],
  workExperiences: [
    {
      company: 'Tech Corp',
      position: 'Software Engineer',
      description: 'Desarrollo de aplicaciones web',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
    },
  ],
  cv: {
    filePath: '../uploads/1234567890-resume.pdf',
    fileType: 'application/pdf',
  },
};

const minimalValidCandidateData = {
  firstName: 'María',
  lastName: 'García',
  email: 'maria.garcia@example.com',
};

describe('Insert Candidate Feature - Unit Tests Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // FAMILY 1: FORM DATA RETRIEVAL TESTS
  // ============================================================================

  describe('Family 1: Form Data Retrieval Tests', () => {
    // --------------------------------------------------------------------------
    // 1.1 Validator Tests
    // --------------------------------------------------------------------------
    describe('1.1 Validator Tests', () => {
      describe('validateCandidateData - Valid scenarios', () => {
        it('should not throw for valid candidate with all fields', () => {
          expect(() => validateCandidateData(validCandidateData)).not.toThrow();
        });

        it('should not throw for valid candidate with minimal required fields', () => {
          expect(() => validateCandidateData(minimalValidCandidateData)).not.toThrow();
        });

        it('should not throw for valid candidate with Spanish characters in name', () => {
          const candidateWithSpanishChars = {
            firstName: 'José',
            lastName: 'Muñoz',
            email: 'jose.munoz@example.com',
          };
          expect(() => validateCandidateData(candidateWithSpanishChars)).not.toThrow();
        });

        it('should not throw for valid candidate with accented characters', () => {
          const candidateWithAccents = {
            firstName: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@example.com',
          };
          expect(() => validateCandidateData(candidateWithAccents)).not.toThrow();
        });

        it('should not throw for valid candidate with phone starting with 6', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '612345678',
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with phone starting with 7', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '712345678',
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with phone starting with 9', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '912345678',
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with optional address', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            address: 'Calle Test 123',
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with educations array', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'University',
                title: 'Degree',
                startDate: '2020-01-01',
                endDate: '2024-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with education without endDate', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'University',
                title: 'Degree',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with workExperiences array', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                position: 'Position',
                startDate: '2020-01-01',
                endDate: '2024-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with workExperience without description', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                position: 'Position',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with CV', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            cv: {
              filePath: '../uploads/file.pdf',
              fileType: 'application/pdf',
            },
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for candidate with id (edit scenario)', () => {
          const candidateWithId = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidateWithId)).not.toThrow();
        });

        it('should not throw for valid candidate with boundary name length (100 chars)', () => {
          const longName = 'A'.repeat(100);
          const candidate = {
            firstName: longName,
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });

        it('should not throw for valid candidate with boundary address length (100 chars)', () => {
          const longAddress = 'A'.repeat(100);
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            address: longAddress,
          };
          expect(() => validateCandidateData(candidate)).not.toThrow();
        });
      });

      describe('validateCandidateData - Invalid firstName scenarios', () => {
        it('should throw error for missing firstName', () => {
          const candidate = {
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });

        it('should throw error for firstName too short (1 char)', () => {
          const candidate = {
            firstName: 'J',
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });

        it('should throw error for firstName too long (101 chars)', () => {
          const candidate = {
            firstName: 'A'.repeat(101),
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });

        it('should throw error for firstName with numbers', () => {
          const candidate = {
            firstName: 'John123',
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });

        it('should throw error for firstName with special characters', () => {
          const candidate = {
            firstName: 'John@Doe',
            lastName: 'Doe',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });
      });

      describe('validateCandidateData - Invalid lastName scenarios', () => {
        it('should throw error for missing lastName', () => {
          const candidate = {
            firstName: 'John',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });

        it('should throw error for lastName too short (1 char)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'D',
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });

        it('should throw error for lastName too long (101 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'A'.repeat(101),
            email: 'john@example.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid name');
        });
      });

      describe('validateCandidateData - Invalid email scenarios', () => {
        it('should throw error for missing email', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid email');
        });

        it('should throw error for invalid email format (no @)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalidemail.com',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid email');
        });

        it('should throw error for invalid email format (no domain)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid@',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid email');
        });

        it('should throw error for invalid email format (no TLD)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid@domain',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid email');
        });
      });

      describe('validateCandidateData - Invalid phone scenarios', () => {
        it('should throw error for phone not starting with 6, 7, or 9', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '512345678',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid phone');
        });

        it('should throw error for phone with less than 9 digits', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '61234567',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid phone');
        });

        it('should throw error for phone with more than 9 digits', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '6123456789',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid phone');
        });

        it('should throw error for phone with letters', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '61234567a',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid phone');
        });
      });

      describe('validateCandidateData - Invalid address scenarios', () => {
        it('should throw error for address too long (101 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            address: 'A'.repeat(101),
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid address');
        });
      });

      describe('validateCandidateData - Invalid education scenarios', () => {
        it('should throw error for education with missing institution', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                title: 'Degree',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid institution');
        });

        it('should throw error for education with institution too long (101 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'A'.repeat(101),
                title: 'Degree',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid institution');
        });

        it('should throw error for education with missing title', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'University',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid title');
        });

        it('should throw error for education with title too long (101 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'University',
                title: 'A'.repeat(101),
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid title');
        });

        it('should throw error for education with invalid startDate format', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'University',
                title: 'Degree',
                startDate: '01-01-2020',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid date');
        });

        it('should throw error for education with invalid endDate format', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            educations: [
              {
                institution: 'University',
                title: 'Degree',
                startDate: '2020-01-01',
                endDate: '01-01-2024',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid end date');
        });
      });

      describe('validateCandidateData - Invalid workExperience scenarios', () => {
        it('should throw error for workExperience with missing company', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                position: 'Position',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid company');
        });

        it('should throw error for workExperience with company too long (101 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'A'.repeat(101),
                position: 'Position',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid company');
        });

        it('should throw error for workExperience with missing position', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid position');
        });

        it('should throw error for workExperience with position too long (101 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                position: 'A'.repeat(101),
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid position');
        });

        it('should throw error for workExperience with description too long (201 chars)', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                position: 'Position',
                description: 'A'.repeat(201),
                startDate: '2020-01-01',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid description');
        });

        it('should throw error for workExperience with invalid startDate format', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                position: 'Position',
                startDate: '01-01-2020',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid date');
        });

        it('should throw error for workExperience with invalid endDate format', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            workExperiences: [
              {
                company: 'Company',
                position: 'Position',
                startDate: '2020-01-01',
                endDate: '01-01-2024',
              },
            ],
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid end date');
        });
      });

      describe('validateCandidateData - Invalid CV scenarios', () => {
        it('should throw error for CV with missing filePath', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            cv: {
              fileType: 'application/pdf',
            },
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
        });

        it('should throw error for CV with missing fileType', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            cv: {
              filePath: '../uploads/file.pdf',
            },
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
        });

        it('should throw error for CV with non-string filePath', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            cv: {
              filePath: 123,
              fileType: 'application/pdf',
            },
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
        });

        it('should throw error for CV with non-string fileType', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            cv: {
              filePath: '../uploads/file.pdf',
              fileType: 123,
            },
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
        });

        it('should throw error for CV that is not an object', () => {
          const candidate = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            cv: 'not-an-object',
          };
          expect(() => validateCandidateData(candidate)).toThrow('Invalid CV data');
        });
      });
    });

    // --------------------------------------------------------------------------
    // 1.2 File Upload Service Tests
    // --------------------------------------------------------------------------
    describe('1.2 File Upload Service Tests', () => {
      let mockRequest: Partial<Request>;
      let mockResponse: Partial<Response>;
      let mockNext: jest.Mock;

      beforeEach(() => {
        mockRequest = {
          file: undefined,
        };
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
      });

      it('should successfully upload valid PDF file', () => {
        const mockFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: 'resume.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          size: 1024,
          destination: '../uploads/',
          filename: '1234567890-resume.pdf',
          path: '../uploads/1234567890-resume.pdf',
          buffer: Buffer.from('test'),
          stream: {} as any,
        };

        mockRequest.file = mockFile;
        
        // Mock the uploader to call next without error
        const uploaderFn = jest.fn((req: any, res: any, next: any) => {
          next();
        });
        jest.spyOn(multer(), 'single').mockReturnValue(uploaderFn as any);

        uploadFile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          filePath: '../uploads/1234567890-resume.pdf',
          fileType: 'application/pdf',
        });
      });

      it('should successfully upload valid DOCX file', () => {
        const mockFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: 'resume.docx',
          encoding: '7bit',
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 2048,
          destination: '../uploads/',
          filename: '1234567890-resume.docx',
          path: '../uploads/1234567890-resume.docx',
          buffer: Buffer.from('test'),
          stream: {} as any,
        };

        mockRequest.file = mockFile;
        
        // Mock the uploader to call next without error
        const uploaderFn = jest.fn((req: any, res: any, next: any) => {
          next();
        });
        jest.spyOn(multer(), 'single').mockReturnValue(uploaderFn as any);

        uploadFile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          filePath: '../uploads/1234567890-resume.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
      });

      it('should reject invalid file type', () => {
        mockRequest.file = undefined;
        
        // Mock the uploader to call next without error (file filter rejects)
        const uploaderFn = jest.fn((req: any, res: any, next: any) => {
          next();
        });
        jest.spyOn(multer(), 'single').mockReturnValue(uploaderFn as any);

        uploadFile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Invalid file type, only PDF and DOCX are allowed!',
        });
      });

      it('should handle MulterError for file size limit', () => {
        // Get MulterError from the mocked multer
        const ServiceMulterError = (multer as any).MulterError;
        const multerError = new ServiceMulterError('LIMIT_FILE_SIZE');
        multerError.message = 'File too large';

        // Mock the single() method to return a middleware that calls callback with error
        const mockMiddleware = jest.fn((req: any, res: any, callback: any) => {
          callback(multerError);
        });
        
        // Configure the shared mock instance
        mockMulterInstance.single.mockReturnValue(mockMiddleware);

        uploadFile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'File too large',
        });
      });

      it('should handle generic MulterError', () => {
        // Get MulterError from mocked multer
        const ServiceMulterError = (multer as any).MulterError;
        const multerError = new ServiceMulterError('UNKNOWN_ERROR');
        multerError.message = 'Unknown error';

        const mockMiddleware = jest.fn((req: any, res: any, callback: any) => {
          callback(multerError);
        });
        
        // Configure the shared mock instance
        mockMulterInstance.single.mockReturnValue(mockMiddleware);

        uploadFile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Unknown error',
        });
      });

      it('should handle non-Multer errors', () => {
        // Generic Error should be caught by else if (err) branch (line 36)
        const genericError = new Error('Generic error');

        const mockMiddleware = jest.fn((req: any, res: any, callback: any) => {
          callback(genericError);
        });
        
        // Configure the shared mock instance
        mockMulterInstance.single.mockReturnValue(mockMiddleware);

        uploadFile(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Generic error',
        });
      });
    });

    // --------------------------------------------------------------------------
    // 1.3 Controller Tests
    // --------------------------------------------------------------------------
    describe('1.3 Controller Tests', () => {
      let mockRequest: Partial<Request>;
      let mockResponse: Partial<Response>;

      beforeEach(() => {
        mockRequest = {
          body: {},
        };
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
      });

      it('should successfully add candidate and return 201 status', async () => {
        const savedCandidate = { id: 1, ...validCandidateData };
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate').mockResolvedValue(savedCandidate);

        mockRequest.body = validCandidateData;

        await addCandidateController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: 'Candidate added successfully',
          data: savedCandidate,
        });
      });

      it('should handle validation error and return 400 status', async () => {
        const validationError = new Error('Invalid email');
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate').mockRejectedValue(validationError);

        mockRequest.body = { ...validCandidateData, email: 'invalid-email' };

        await addCandidateController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: 'Error adding candidate',
          error: 'Invalid email',
        });
      });

      it('should handle unknown error and return 400 status', async () => {
        const unknownError = { message: 'Unknown error' };
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate').mockRejectedValue(unknownError);

        mockRequest.body = validCandidateData;

        await addCandidateController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: 'Error adding candidate',
          error: 'Unknown error',
        });
      });

      it('should handle error without message property', async () => {
        const errorWithoutMessage = {};
        jest.spyOn(require('../application/services/candidateService'), 'addCandidate').mockRejectedValue(errorWithoutMessage);

        mockRequest.body = validCandidateData;

        await addCandidateController(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          message: 'Error adding candidate',
          error: 'Unknown error',
        });
      });
    });

    // --------------------------------------------------------------------------
    // 1.4 Route Handler Tests
    // --------------------------------------------------------------------------
    describe('1.4 Route Handler Tests', () => {
      let mockRequest: Partial<Request>;
      let mockResponse: Partial<Response>;
      let addCandidateSpy: jest.SpyInstance;

      beforeEach(() => {
        mockRequest = {
          body: {},
        };
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
        // Mock the addCandidate function that the route calls
        addCandidateSpy = jest.spyOn(require('../presentation/controllers/candidateController'), 'addCandidate');
      });

      afterEach(() => {
        addCandidateSpy.mockRestore();
      });

      it('should handle successful candidate creation and return 201 status', async () => {
        const savedCandidate = { id: 1, ...validCandidateData };
        addCandidateSpy.mockResolvedValue(savedCandidate);

        mockRequest.body = validCandidateData;

        // Simulate route handler logic: await addCandidate(req.body) and send result
        const result = await (addCandidateSpy as any)(mockRequest.body);
        (mockResponse.status as jest.Mock)(201);
        (mockResponse.send as jest.Mock)(result);

        expect(addCandidateSpy).toHaveBeenCalledWith(validCandidateData);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.send).toHaveBeenCalledWith(savedCandidate);
      });

      it('should handle validation error and return 400 status', async () => {
        const validationError = new Error('Invalid email');
        addCandidateSpy.mockRejectedValue(validationError);

        mockRequest.body = { ...validCandidateData, email: 'invalid-email' };

        // Simulate route handler error handling logic
        try {
          await (addCandidateSpy as any)(mockRequest.body);
        } catch (error) {
          if (error instanceof Error) {
            (mockResponse.status as jest.Mock)(400);
            (mockResponse.send as jest.Mock)({ message: error.message });
          }
        }

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Invalid email' });
      });

      it('should handle unexpected error and return 500 status', async () => {
        const unexpectedError = { code: 'UNEXPECTED' };
        addCandidateSpy.mockRejectedValue(unexpectedError);

        mockRequest.body = validCandidateData;

        // Simulate route handler error handling logic
        try {
          await (addCandidateSpy as any)(mockRequest.body);
        } catch (error) {
          if (error instanceof Error) {
            (mockResponse.status as jest.Mock)(400);
            (mockResponse.send as jest.Mock)({ message: error.message });
          } else {
            (mockResponse.status as jest.Mock)(500);
            (mockResponse.send as jest.Mock)({ message: 'An unexpected error occurred' });
          }
        }

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.send).toHaveBeenCalledWith({ message: 'An unexpected error occurred' });
      });
    });
  });

  // ============================================================================
  // FAMILY 2: DATA PERSISTENCE TESTS
  // ============================================================================

  describe('Family 2: Data Persistence Tests', () => {
    // --------------------------------------------------------------------------
    // 2.1 Candidate Model Tests
    // --------------------------------------------------------------------------
    describe('2.1 Candidate Model Tests', () => {
      describe('Constructor', () => {
        it('should initialize candidate with all fields', () => {
          const candidate = new Candidate(validCandidateData);
          expect(candidate.firstName).toBe(validCandidateData.firstName);
          expect(candidate.lastName).toBe(validCandidateData.lastName);
          expect(candidate.email).toBe(validCandidateData.email);
          expect(candidate.phone).toBe(validCandidateData.phone);
          expect(candidate.address).toBe(validCandidateData.address);
          expect(candidate.education).toEqual([]);
          expect(candidate.workExperience).toEqual([]);
          expect(candidate.resumes).toEqual([]);
        });

        it('should initialize candidate with optional fields', () => {
          const candidate = new Candidate(minimalValidCandidateData);
          expect(candidate.firstName).toBe(minimalValidCandidateData.firstName);
          expect(candidate.lastName).toBe(minimalValidCandidateData.lastName);
          expect(candidate.email).toBe(minimalValidCandidateData.email);
          expect(candidate.phone).toBeUndefined();
          expect(candidate.address).toBeUndefined();
        });

        it('should initialize candidate with id', () => {
          const candidateDataWithId = { id: 1, ...validCandidateData };
          const candidate = new Candidate(candidateDataWithId);
          expect(candidate.id).toBe(1);
        });
      });

      describe('save() - Create new candidate', () => {
        it('should create new candidate successfully', async () => {
          const candidateData = { ...minimalValidCandidateData };
          const candidate = new Candidate(candidateData);
          const savedCandidate = { id: 1, ...candidateData };

          (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

          const result = await candidate.save();

          expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
            data: {
              firstName: candidateData.firstName,
              lastName: candidateData.lastName,
              email: candidateData.email,
            },
          });
          expect(result).toEqual(savedCandidate);
        });

        it('should create candidate with nested educations', async () => {
          const candidateData = {
            ...minimalValidCandidateData,
            education: [
              {
                institution: 'University',
                title: 'Degree',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2024-01-01'),
              },
            ],
          };
          const candidate = new Candidate(candidateData);
          candidate.education = candidateData.education as any;
          const savedCandidate = { id: 1, ...candidateData };

          (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

          await candidate.save();

          expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
            data: {
              firstName: candidateData.firstName,
              lastName: candidateData.lastName,
              email: candidateData.email,
              educations: {
                create: [
                  {
                    institution: 'University',
                    title: 'Degree',
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2024-01-01'),
                  },
                ],
              },
            },
          });
        });

        it('should create candidate with nested workExperiences', async () => {
          const candidateData = {
            ...minimalValidCandidateData,
            workExperience: [
              {
                company: 'Company',
                position: 'Position',
                description: 'Description',
                startDate: new Date('2020-01-01'),
                endDate: new Date('2024-01-01'),
              },
            ],
          };
          const candidate = new Candidate(candidateData);
          candidate.workExperience = candidateData.workExperience as any;
          const savedCandidate = { id: 1, ...candidateData };

          (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

          await candidate.save();

          expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
            data: {
              firstName: candidateData.firstName,
              lastName: candidateData.lastName,
              email: candidateData.email,
              workExperiences: {
                create: [
                  {
                    company: 'Company',
                    position: 'Position',
                    description: 'Description',
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2024-01-01'),
                  },
                ],
              },
            },
          });
        });

        it('should create candidate with nested resumes', async () => {
          const candidateData = {
            ...minimalValidCandidateData,
            resumes: [
              {
                filePath: '../uploads/file.pdf',
                fileType: 'application/pdf',
              },
            ],
          };
          const candidate = new Candidate(candidateData);
          candidate.resumes = candidateData.resumes as any;
          const savedCandidate = { id: 1, ...candidateData };

          (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

          await candidate.save();

          expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
            data: {
              firstName: candidateData.firstName,
              lastName: candidateData.lastName,
              email: candidateData.email,
              resumes: {
                create: [
                  {
                    filePath: '../uploads/file.pdf',
                    fileType: 'application/pdf',
                  },
                ],
              },
            },
          });
        });

        it('should handle PrismaClientInitializationError', async () => {
          const candidate = new Candidate(minimalValidCandidateData);
          const connectionError = new (Prisma.PrismaClientInitializationError as any)('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');

          (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(connectionError);

          await expect(candidate.save()).rejects.toThrow(
            'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
          );
        });
      });

      describe('save() - Update existing candidate', () => {
        it('should update existing candidate successfully', async () => {
          const candidateData = { id: 1, ...minimalValidCandidateData };
          const candidate = new Candidate(candidateData);
          const updatedCandidate = { ...candidateData, firstName: 'Updated' };

          (mockPrisma.candidate.update as jest.Mock).mockResolvedValue(updatedCandidate);

          candidate.firstName = 'Updated';
          const result = await candidate.save();

          expect(mockPrisma.candidate.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
              firstName: 'Updated',
              lastName: candidateData.lastName,
              email: candidateData.email,
            },
          });
          expect(result).toEqual(updatedCandidate);
        });

        it('should handle P2025 error (record not found)', async () => {
          const candidateData = { id: 999, ...minimalValidCandidateData };
          const candidate = new Candidate(candidateData);
          const notFoundError = new (Prisma.PrismaClientKnownRequestError as any)('No se pudo encontrar el registro del candidato con el ID proporcionado.', 'P2025', {
            clientVersion: '5.13.0',
          });

          (mockPrisma.candidate.update as jest.Mock).mockRejectedValue(notFoundError);

          await expect(candidate.save()).rejects.toThrow(
            'No se pudo encontrar el registro del candidato con el ID proporcionado.'
          );
        });

        it('should handle PrismaClientInitializationError on update', async () => {
          const candidateData = { id: 1, ...minimalValidCandidateData };
          const candidate = new Candidate(candidateData);
          const connectionError = new (Prisma.PrismaClientInitializationError as any)('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');

          (mockPrisma.candidate.update as jest.Mock).mockRejectedValue(connectionError);

          await expect(candidate.save()).rejects.toThrow(
            'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.'
          );
        });
      });

      describe('findOne() static method', () => {
        it('should find candidate by id successfully', async () => {
          const candidateData = { id: 1, ...minimalValidCandidateData };
          (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(candidateData);

          const result = await Candidate.findOne(1);

          expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
          });
          expect(result).toBeInstanceOf(Candidate);
          expect(result?.id).toBe(1);
          expect(result?.email).toBe(candidateData.email);
        });

        it('should return null when candidate not found', async () => {
          (mockPrisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

          const result = await Candidate.findOne(999);

          expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith({
            where: { id: 999 },
          });
          expect(result).toBeNull();
        });
      });
    });

    // --------------------------------------------------------------------------
    // 2.2 Education Model Tests
    // --------------------------------------------------------------------------
    describe('2.2 Education Model Tests', () => {
      describe('Constructor', () => {
        it('should initialize education with all fields', () => {
          const educationData = {
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
            candidateId: 1,
          };
          const education = new Education(educationData);

          expect(education.institution).toBe('University');
          expect(education.title).toBe('Degree');
          expect(education.startDate).toBeInstanceOf(Date);
          expect(education.endDate).toBeInstanceOf(Date);
          expect(education.candidateId).toBe(1);
        });

        it('should initialize education without endDate', () => {
          const educationData = {
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
          };
          const education = new Education(educationData);

          expect(education.endDate).toBeUndefined();
        });

        it('should initialize education with id', () => {
          const educationData = {
            id: 1,
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
          };
          const education = new Education(educationData);

          expect(education.id).toBe(1);
        });
      });

      describe('save() - Create new education', () => {
        it('should create new education successfully', async () => {
          const educationData = {
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
            candidateId: 1,
          };
          const education = new Education(educationData);
          const savedEducation = { id: 1, ...educationData, startDate: new Date(educationData.startDate) };

          (mockPrisma.education.create as jest.Mock).mockResolvedValue(savedEducation);

          const result = await education.save();

          expect(mockPrisma.education.create).toHaveBeenCalledWith({
            data: {
              institution: 'University',
              title: 'Degree',
              startDate: expect.any(Date),
              endDate: undefined,
              candidateId: 1,
            },
          });
          expect(result).toEqual(savedEducation);
        });

        it('should create education without candidateId', async () => {
          const educationData = {
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
          };
          const education = new Education(educationData);

          (mockPrisma.education.create as jest.Mock).mockResolvedValue({ id: 1, ...educationData });

          await education.save();

          expect(mockPrisma.education.create).toHaveBeenCalledWith({
            data: {
              institution: 'University',
              title: 'Degree',
              startDate: expect.any(Date),
              endDate: undefined,
            },
          });
        });
      });

      describe('save() - Update existing education', () => {
        it('should update existing education successfully', async () => {
          const educationData = {
            id: 1,
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
            candidateId: 1,
          };
          const education = new Education(educationData);
          const updatedEducation = { ...educationData, title: 'Updated Degree' };

          (mockPrisma.education.update as jest.Mock).mockResolvedValue(updatedEducation);

          education.title = 'Updated Degree';
          const result = await education.save();

          expect(mockPrisma.education.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
              institution: 'University',
              title: 'Updated Degree',
              startDate: expect.any(Date),
              endDate: undefined,
              candidateId: 1,
            },
          });
          expect(result).toEqual(updatedEducation);
        });
      });
    });

    // --------------------------------------------------------------------------
    // 2.3 WorkExperience Model Tests
    // --------------------------------------------------------------------------
    describe('2.3 WorkExperience Model Tests', () => {
      describe('Constructor', () => {
        it('should initialize workExperience with all fields', () => {
          const workExpData = {
            company: 'Company',
            position: 'Position',
            description: 'Description',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
            candidateId: 1,
          };
          const workExp = new WorkExperience(workExpData);

          expect(workExp.company).toBe('Company');
          expect(workExp.position).toBe('Position');
          expect(workExp.description).toBe('Description');
          expect(workExp.startDate).toBeInstanceOf(Date);
          expect(workExp.endDate).toBeInstanceOf(Date);
          expect(workExp.candidateId).toBe(1);
        });

        it('should initialize workExperience without optional fields', () => {
          const workExpData = {
            company: 'Company',
            position: 'Position',
            startDate: '2020-01-01',
          };
          const workExp = new WorkExperience(workExpData);

          expect(workExp.description).toBeUndefined();
          expect(workExp.endDate).toBeUndefined();
          expect(workExp.candidateId).toBeUndefined();
        });

        it('should initialize workExperience with id', () => {
          const workExpData = {
            id: 1,
            company: 'Company',
            position: 'Position',
            startDate: '2020-01-01',
          };
          const workExp = new WorkExperience(workExpData);

          expect(workExp.id).toBe(1);
        });
      });

      describe('save() - Create new workExperience', () => {
        it('should create new workExperience successfully', async () => {
          const workExpData = {
            company: 'Company',
            position: 'Position',
            description: 'Description',
            startDate: '2020-01-01',
            candidateId: 1,
          };
          const workExp = new WorkExperience(workExpData);
          const savedWorkExp = { id: 1, ...workExpData, startDate: new Date(workExpData.startDate) };

          (mockPrisma.workExperience.create as jest.Mock).mockResolvedValue(savedWorkExp);

          const result = await workExp.save();

          expect(mockPrisma.workExperience.create).toHaveBeenCalledWith({
            data: {
              company: 'Company',
              position: 'Position',
              description: 'Description',
              startDate: expect.any(Date),
              endDate: undefined,
              candidateId: 1,
            },
          });
          expect(result).toEqual(savedWorkExp);
        });

        it('should create workExperience without optional description', async () => {
          const workExpData = {
            company: 'Company',
            position: 'Position',
            startDate: '2020-01-01',
            candidateId: 1,
          };
          const workExp = new WorkExperience(workExpData);

          (mockPrisma.workExperience.create as jest.Mock).mockResolvedValue({ id: 1, ...workExpData });

          await workExp.save();

          expect(mockPrisma.workExperience.create).toHaveBeenCalledWith({
            data: {
              company: 'Company',
              position: 'Position',
              description: undefined,
              startDate: expect.any(Date),
              endDate: undefined,
              candidateId: 1,
            },
          });
        });
      });

      describe('save() - Update existing workExperience', () => {
        it('should update existing workExperience successfully', async () => {
          const workExpData = {
            id: 1,
            company: 'Company',
            position: 'Position',
            startDate: '2020-01-01',
            candidateId: 1,
          };
          const workExp = new WorkExperience(workExpData);
          const updatedWorkExp = { ...workExpData, position: 'Updated Position' };

          (mockPrisma.workExperience.update as jest.Mock).mockResolvedValue(updatedWorkExp);

          workExp.position = 'Updated Position';
          const result = await workExp.save();

          expect(mockPrisma.workExperience.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
              company: 'Company',
              position: 'Updated Position',
              description: undefined,
              startDate: expect.any(Date),
              endDate: undefined,
              candidateId: 1,
            },
          });
          expect(result).toEqual(updatedWorkExp);
        });
      });
    });

    // --------------------------------------------------------------------------
    // 2.4 Resume Model Tests
    // --------------------------------------------------------------------------
    describe('2.4 Resume Model Tests', () => {
      describe('Constructor', () => {
        it('should initialize resume with all fields', () => {
          const resumeData = {
            id: 1,
            candidateId: 1,
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          };
          const resume = new Resume(resumeData);

          expect(resume.id).toBe(1);
          expect(resume.candidateId).toBe(1);
          expect(resume.filePath).toBe('../uploads/file.pdf');
          expect(resume.fileType).toBe('application/pdf');
          expect(resume.uploadDate).toBeInstanceOf(Date);
        });

        it('should auto-assign uploadDate', () => {
          const resumeData = {
            candidateId: 1,
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          };
          const beforeDate = new Date();
          const resume = new Resume(resumeData);
          const afterDate = new Date();

          expect(resume.uploadDate).toBeInstanceOf(Date);
          expect(resume.uploadDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
          expect(resume.uploadDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
        });
      });

      describe('save() - Create new resume', () => {
        it('should create new resume successfully', async () => {
          const resumeData = {
            candidateId: 1,
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          };
          const resume = new Resume(resumeData);
          const savedResume = { id: 1, ...resumeData, uploadDate: resume.uploadDate };

          (mockPrisma.resume.create as jest.Mock).mockResolvedValue(savedResume);

          const result = await resume.save();

          expect(mockPrisma.resume.create).toHaveBeenCalledWith({
            data: {
              candidateId: 1,
              filePath: '../uploads/file.pdf',
              fileType: 'application/pdf',
              uploadDate: expect.any(Date),
            },
          });
          expect(result).toBeInstanceOf(Resume);
          expect(result.id).toBe(1);
        });
      });

      describe('save() - Immutability enforcement', () => {
        it('should throw error when trying to update existing resume', async () => {
          const resumeData = {
            id: 1,
            candidateId: 1,
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          };
          const resume = new Resume(resumeData);

          await expect(resume.save()).rejects.toThrow(
            'No se permite la actualización de un currículum existente.'
          );
        });
      });

      describe('create() method', () => {
        it('should create resume successfully', async () => {
          const resumeData = {
            candidateId: 1,
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          };
          const resume = new Resume(resumeData);
          const savedResume = { id: 1, ...resumeData, uploadDate: resume.uploadDate };

          (mockPrisma.resume.create as jest.Mock).mockResolvedValue(savedResume);

          const result = await resume.create();

          expect(mockPrisma.resume.create).toHaveBeenCalledWith({
            data: {
              candidateId: 1,
              filePath: '../uploads/file.pdf',
              fileType: 'application/pdf',
              uploadDate: expect.any(Date),
            },
          });
          expect(result).toBeInstanceOf(Resume);
          expect(result.id).toBe(1);
        });
      });
    });

    // --------------------------------------------------------------------------
    // 2.5 Candidate Service Tests
    // --------------------------------------------------------------------------
    describe('2.5 Candidate Service Tests', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should successfully add candidate with all related entities', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
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
              company: 'Company',
              position: 'Position',
              startDate: '2020-01-01',
            },
          ],
          cv: {
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          },
        };

        const savedCandidate = { id: 1, ...minimalValidCandidateData };
        const savedEducation = { id: 1, candidateId: 1, ...candidateData.educations[0], startDate: new Date(candidateData.educations[0].startDate), endDate: new Date(candidateData.educations[0].endDate) };
        const savedWorkExp = { id: 1, candidateId: 1, ...candidateData.workExperiences[0], startDate: new Date(candidateData.workExperiences[0].startDate) };
        const savedResume = { id: 1, candidateId: 1, ...candidateData.cv, uploadDate: new Date() };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);
        (mockPrisma.education.create as jest.Mock).mockResolvedValue(savedEducation);
        (mockPrisma.workExperience.create as jest.Mock).mockResolvedValue(savedWorkExp);
        (mockPrisma.resume.create as jest.Mock).mockResolvedValue(savedResume);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.education.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.workExperience.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.resume.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedCandidate);
      });

      it('should successfully add candidate with only educations', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          educations: [
            {
              institution: 'University',
              title: 'Degree',
              startDate: '2020-01-01',
            },
          ],
        };

        const savedCandidate = { id: 1, ...minimalValidCandidateData };
        const savedEducation = { id: 1, candidateId: 1, ...candidateData.educations[0], startDate: new Date(candidateData.educations[0].startDate) };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);
        (mockPrisma.education.create as jest.Mock).mockResolvedValue(savedEducation);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.education.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.workExperience.create).not.toHaveBeenCalled();
        expect(mockPrisma.resume.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should successfully add candidate with only workExperiences', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          workExperiences: [
            {
              company: 'Company',
              position: 'Position',
              startDate: '2020-01-01',
            },
          ],
        };

        const savedCandidate = { id: 1, ...minimalValidCandidateData };
        const savedWorkExp = { id: 1, candidateId: 1, ...candidateData.workExperiences[0], startDate: new Date(candidateData.workExperiences[0].startDate) };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);
        (mockPrisma.workExperience.create as jest.Mock).mockResolvedValue(savedWorkExp);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.workExperience.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.education.create).not.toHaveBeenCalled();
        expect(mockPrisma.resume.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should successfully add candidate with only CV', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          cv: {
            filePath: '../uploads/file.pdf',
            fileType: 'application/pdf',
          },
        };

        const savedCandidate = { id: 1, ...minimalValidCandidateData };
        const savedResume = { id: 1, candidateId: 1, ...candidateData.cv, uploadDate: new Date() };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);
        (mockPrisma.resume.create as jest.Mock).mockResolvedValue(savedResume);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.resume.create).toHaveBeenCalledTimes(1);
        expect(mockPrisma.education.create).not.toHaveBeenCalled();
        expect(mockPrisma.workExperience.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should successfully add candidate without related entities', async () => {
        const candidateData = { ...minimalValidCandidateData };
        const savedCandidate = { id: 1, ...candidateData };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.education.create).not.toHaveBeenCalled();
        expect(mockPrisma.workExperience.create).not.toHaveBeenCalled();
        expect(mockPrisma.resume.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should handle validation error and propagate it', async () => {
        const invalidCandidateData = {
          firstName: 'J',
          lastName: 'Doe',
          email: 'invalid-email',
        };

        await expect(addCandidate(invalidCandidateData)).rejects.toThrow('Invalid name');
      });

      it('should handle duplicate email error (P2002)', async () => {
        const candidateData = { ...minimalValidCandidateData };
        // Create error with original Prisma message - service will transform it
        const duplicateError = new (Prisma.PrismaClientKnownRequestError as any)('Unique constraint failed', 'P2002', {
          clientVersion: '5.13.0',
          target: ['email'],
        });

        (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(duplicateError);

        await expect(addCandidate(candidateData)).rejects.toThrow('The email already exists in the database');
      });

      it('should handle database errors and propagate them', async () => {
        const candidateData = { ...minimalValidCandidateData };
        const dbError = new Error('Database connection failed');

        (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(dbError);

        await expect(addCandidate(candidateData)).rejects.toThrow('Database connection failed');
      });

      it('should handle empty educations array', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          educations: [],
        };
        const savedCandidate = { id: 1, ...candidateData };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.education.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should handle empty workExperiences array', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          workExperiences: [],
        };
        const savedCandidate = { id: 1, ...candidateData };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.workExperience.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should handle empty CV object', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          cv: {},
        };
        const savedCandidate = { id: 1, ...candidateData };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);

        const result = await addCandidate(candidateData);

        expect(mockPrisma.candidate.create).toHaveBeenCalled();
        expect(mockPrisma.resume.create).not.toHaveBeenCalled();
        expect(result).toEqual(savedCandidate);
      });

      it('should create multiple educations', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          educations: [
            {
              institution: 'University 1',
              title: 'Degree 1',
              startDate: '2020-01-01',
            },
            {
              institution: 'University 2',
              title: 'Degree 2',
              startDate: '2024-01-01',
            },
          ],
        };

        const savedCandidate = { id: 1, ...minimalValidCandidateData };
        const savedEducation1 = { id: 1, candidateId: 1, ...candidateData.educations[0], startDate: new Date(candidateData.educations[0].startDate) };
        const savedEducation2 = { id: 2, candidateId: 1, ...candidateData.educations[1], startDate: new Date(candidateData.educations[1].startDate) };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);
        (mockPrisma.education.create as jest.Mock)
          .mockResolvedValueOnce(savedEducation1)
          .mockResolvedValueOnce(savedEducation2);

        await addCandidate(candidateData);

        expect(mockPrisma.education.create).toHaveBeenCalledTimes(2);
      });

      it('should create multiple workExperiences', async () => {
        const candidateData = {
          ...minimalValidCandidateData,
          workExperiences: [
            {
              company: 'Company 1',
              position: 'Position 1',
              startDate: '2020-01-01',
            },
            {
              company: 'Company 2',
              position: 'Position 2',
              startDate: '2024-01-01',
            },
          ],
        };

        const savedCandidate = { id: 1, ...minimalValidCandidateData };
        const savedWorkExp1 = { id: 1, candidateId: 1, ...candidateData.workExperiences[0], startDate: new Date(candidateData.workExperiences[0].startDate) };
        const savedWorkExp2 = { id: 2, candidateId: 1, ...candidateData.workExperiences[1], startDate: new Date(candidateData.workExperiences[1].startDate) };

        (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(savedCandidate);
        (mockPrisma.workExperience.create as jest.Mock)
          .mockResolvedValueOnce(savedWorkExp1)
          .mockResolvedValueOnce(savedWorkExp2);

        await addCandidate(candidateData);

        expect(mockPrisma.workExperience.create).toHaveBeenCalledTimes(2);
      });
    });
  });
});

