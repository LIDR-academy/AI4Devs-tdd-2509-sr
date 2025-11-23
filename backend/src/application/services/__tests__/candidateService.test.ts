import { addCandidate } from '../candidateService';
import { Candidate } from '../../../domain/models/Candidate';
import { Education } from '../../../domain/models/Education';
import { WorkExperience } from '../../../domain/models/WorkExperience';
import { Resume } from '../../../domain/models/Resume';
import { validateCandidateData } from '../../validator';
import { Prisma } from '@prisma/client';
import {
  validCandidateData,
  invalidCandidateData,
  savedCandidate,
} from '../../../__tests__/helpers/testFixtures';

// Mock the domain models and validator
jest.mock('../../../domain/models/Candidate');
jest.mock('../../../domain/models/Education');
jest.mock('../../../domain/models/WorkExperience');
jest.mock('../../../domain/models/Resume');
jest.mock('../../validator');

describe('Candidate Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCandidate', () => {
    it('should successfully save a candidate to the database with correct field mappings', async () => {
      // Arrange
      const mockCandidate = {
        save: jest.fn().mockResolvedValue(savedCandidate),
        id: savedCandidate.id,
        education: [],
        workExperience: [],
        resumes: [],
      };

      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(
        () => mockCandidate as any
      );
      (validateCandidateData as jest.MockedFunction<typeof validateCandidateData>).mockImplementation(
        () => {}
      );

      // Act
      const result = await addCandidate(validCandidateData);

      // Assert
      expect(validateCandidateData).toHaveBeenCalledWith(validCandidateData);
      expect(Candidate).toHaveBeenCalledWith(validCandidateData);
      expect(mockCandidate.save).toHaveBeenCalled();
      expect(result).toEqual(savedCandidate);
      expect(result.id).toBeDefined();
    });

    it('should throw validation error before attempting database save', async () => {
      // Arrange
      const validationError = new Error('Invalid email');
      (validateCandidateData as jest.MockedFunction<typeof validateCandidateData>).mockImplementation(
        () => {
          throw validationError;
        }
      );

      // Act & Assert
      await expect(addCandidate(invalidCandidateData)).rejects.toThrow('Invalid email');
      expect(Candidate).not.toHaveBeenCalled();
    });

    it('should handle duplicate email constraint violation (P2002)', async () => {
      // Arrange
      const mockCandidate = {
        save: jest.fn().mockRejectedValue({
          code: 'P2002',
          meta: { target: ['email'] },
        }),
        id: undefined,
        education: [],
        workExperience: [],
        resumes: [],
      };

      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(
        () => mockCandidate as any
      );
      (validateCandidateData as jest.MockedFunction<typeof validateCandidateData>).mockImplementation(
        () => {}
      );

      // Act & Assert
      await expect(addCandidate(validCandidateData)).rejects.toThrow(
        'The email already exists in the database'
      );
    });

    it('should save related entities (educations, workExperiences, resumes) with correct candidateId', async () => {
      // Arrange
      const mockCandidate = {
        save: jest.fn().mockResolvedValue(savedCandidate),
        id: savedCandidate.id,
        education: [],
        workExperience: [],
        resumes: [],
      };

      const mockEducation = {
        save: jest.fn().mockResolvedValue({ id: 1, candidateId: savedCandidate.id }),
        candidateId: undefined,
      };

      const mockWorkExperience = {
        save: jest.fn().mockResolvedValue({ id: 1, candidateId: savedCandidate.id }),
        candidateId: undefined,
      };

      const mockResume = {
        save: jest.fn().mockResolvedValue({ id: 1, candidateId: savedCandidate.id }),
        candidateId: undefined,
      };

      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(
        () => mockCandidate as any
      );
      (Education as jest.MockedClass<typeof Education>).mockImplementation(
        () => mockEducation as any
      );
      (WorkExperience as jest.MockedClass<typeof WorkExperience>).mockImplementation(
        () => mockWorkExperience as any
      );
      (Resume as jest.MockedClass<typeof Resume>).mockImplementation(() => mockResume as any);
      (validateCandidateData as jest.MockedFunction<typeof validateCandidateData>).mockImplementation(
        () => {}
      );

      // Act
      await addCandidate(validCandidateData);

      // Assert
      expect(Education).toHaveBeenCalledWith(validCandidateData.educations[0]);
      expect(mockEducation.candidateId).toBe(savedCandidate.id);
      expect(mockEducation.save).toHaveBeenCalled();

      expect(WorkExperience).toHaveBeenCalledWith(validCandidateData.workExperiences[0]);
      expect(mockWorkExperience.candidateId).toBe(savedCandidate.id);
      expect(mockWorkExperience.save).toHaveBeenCalled();

      expect(Resume).toHaveBeenCalledWith(validCandidateData.cv);
      expect(mockResume.candidateId).toBe(savedCandidate.id);
      expect(mockResume.save).toHaveBeenCalled();
    });

    it('should handle database connection error (PrismaClientInitializationError)', async () => {
      // Arrange
      const connectionError = new Error('Connection failed');
      connectionError.name = 'PrismaClientInitializationError';
      Object.defineProperty(connectionError, 'constructor', {
        value: Prisma.PrismaClientInitializationError,
      });

      const mockCandidate = {
        save: jest.fn().mockRejectedValue(connectionError),
        id: undefined,
        education: [],
        workExperience: [],
        resumes: [],
      };

      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(
        () => mockCandidate as any
      );
      (validateCandidateData as jest.MockedFunction<typeof validateCandidateData>).mockImplementation(
        () => {}
      );

      // Act & Assert
      await expect(addCandidate(validCandidateData)).rejects.toThrow();
      // The error should be re-thrown (not caught as P2002)
    });
  });
});

