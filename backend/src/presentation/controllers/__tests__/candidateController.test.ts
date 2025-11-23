import { Request, Response } from 'express';
import { addCandidateController } from '../candidateController';
import * as candidateService from '../../../application/services/candidateService';
import { validCandidateData, savedCandidate } from '../../../__tests__/helpers/testFixtures';

// Mock the candidate service
jest.mock('../../../application/services/candidateService');

describe('Candidate Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockRequest = {
      body: {},
    };
    jest.clearAllMocks();
  });

  describe('addCandidateController', () => {
    it('should successfully create a candidate from valid form data', async () => {
      // Arrange
      mockRequest.body = validCandidateData;
      const mockAddCandidate = candidateService.addCandidate as jest.MockedFunction<
        typeof candidateService.addCandidate
      >;
      mockAddCandidate.mockResolvedValue(savedCandidate);

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAddCandidate).toHaveBeenCalledWith(validCandidateData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Candidate added successfully',
        data: savedCandidate,
      });
    });

    it('should return 400 with error message for invalid form data', async () => {
      // Arrange
      mockRequest.body = { firstName: 'J', email: 'invalid-email' };
      const mockAddCandidate = candidateService.addCandidate as jest.MockedFunction<
        typeof candidateService.addCandidate
      >;
      const validationError = new Error('Invalid email');
      mockAddCandidate.mockRejectedValue(validationError);

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAddCandidate).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Invalid email',
      });
    });

    it('should return 400 when service throws database error (duplicate email)', async () => {
      // Arrange
      mockRequest.body = validCandidateData;
      const mockAddCandidate = candidateService.addCandidate as jest.MockedFunction<
        typeof candidateService.addCandidate
      >;
      const duplicateEmailError = new Error('The email already exists in the database');
      mockAddCandidate.mockRejectedValue(duplicateEmailError);

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAddCandidate).toHaveBeenCalledWith(validCandidateData);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'The email already exists in the database',
      });
    });

    it('should return 400 with unknown error message for non-Error exceptions', async () => {
      // Arrange
      mockRequest.body = validCandidateData;
      const mockAddCandidate = candidateService.addCandidate as jest.MockedFunction<
        typeof candidateService.addCandidate
      >;
      mockAddCandidate.mockRejectedValue('Unknown error');

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Unknown error',
      });
    });
  });
});

