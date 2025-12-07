// Tests for the addCandidate service function
// These tests follow Arrange-Act-Assert (AAA) and mock persistence/models

import { addCandidate } from '../application/services/candidateService';

// Mock the validator to control validation behavior in tests
jest.mock('../application/validator', () => ({
  validateCandidateData: jest.fn(),
}));

// Mock domain models to avoid touching the real database (Prisma)
jest.mock('../domain/models/Candidate', () => ({
  Candidate: class {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    education: any[] = [];
    workExperience: any[] = [];
    resumes: any[] = [];
    constructor(data: any) {
      this.id = data.id;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.email = data.email;
    }
    save = jest.fn().mockImplementation(async () => ({ id: 123, firstName: this.firstName, lastName: this.lastName, email: this.email }));
  }
}));

jest.mock('../domain/models/Education', () => ({
  Education: class {
    candidateId?: number;
    institution: string;
    title: string;
    startDate: string;
    endDate?: string;
    constructor(data: any) {
      this.institution = data.institution;
      this.title = data.title;
      this.startDate = data.startDate;
      this.endDate = data.endDate;
    }
    save = jest.fn().mockResolvedValue(true);
  }
}));

jest.mock('../domain/models/WorkExperience', () => ({
  WorkExperience: class {
    candidateId?: number;
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
    constructor(data: any) {
      this.company = data.company;
      this.position = data.position;
      this.description = data.description;
      this.startDate = data.startDate;
      this.endDate = data.endDate;
    }
    save = jest.fn().mockResolvedValue(true);
  }
}));

jest.mock('../domain/models/Resume', () => ({
  Resume: class {
    candidateId?: number;
    filePath: string;
    fileType: string;
    constructor(data: any) {
      this.filePath = data.filePath;
      this.fileType = data.fileType;
    }
    save = jest.fn().mockResolvedValue(true);
  }
}));

describe('Candidate Service - addCandidate', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Arrange-Act-Assert: should throw when validation fails', async () => {
    // Arrange: mock validator to throw an error
    const { validateCandidateData } = require('../application/validator');
    validateCandidateData.mockImplementation(() => { throw new Error('Invalid data'); });

    const invalidData = { firstName: '', lastName: '', email: 'bad' };

    // Act & Assert: calling addCandidate should reject with an error
    await expect(addCandidate(invalidData)).rejects.toThrow('Error');
  });

  test('Arrange-Act-Assert: should save candidate and related entities when data is valid', async () => {
    // Arrange: valid candidate payload with educations, experiences and cv
    const validData = {
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@example.com',
      educations: [ { institution: 'U1', title: 'BS', startDate: '2020-01-01' } ],
      workExperiences: [ { company: 'X Corp', position: 'Dev', startDate: '2021-01-01' } ],
      cv: { filePath: '/tmp/cv.pdf', fileType: 'application/pdf' }
    };

    // Act: call the service (mocks ensure no DB is hit)
    const saved = await addCandidate(validData as any);

    // Assert: saved candidate returned and has expected id
    expect(saved).toBeDefined();
    expect(saved.id).toBe(123);
  });
});
