/**
 * Unit Tests for Candidate Insertion
 * 
 * These tests cover the complete candidate insertion flow including:
 * - Candidate service (addCandidate)
 * - Candidate model (save)
 * - Validation logic
 * - Related entities (Education, WorkExperience, Resume)
 * 
 * Following best practices:
 * - AAA pattern (Arrange-Act-Assert)
 * - Descriptive test names
 * - Isolated tests with mocked dependencies
 * - Edge case coverage
 * - Parametrized tests for similar scenarios
 */

import { Prisma } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create a deep mock of PrismaClient before importing the modules
const prismaMock = mockDeep<any>();

// Mock the PrismaClient module before any imports
jest.mock('@prisma/client', () => ({
    __esModule: true,
    PrismaClient: jest.fn().mockImplementation(() => prismaMock),
    Prisma: {
        PrismaClientInitializationError: class PrismaClientInitializationError extends Error {
            constructor(message: string, clientVersion: any) {
                super(message);
                this.name = 'PrismaClientInitializationError';
            }
        }
    }
}));

// Now import the modules that use PrismaClient
import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import { validateCandidateData } from '../application/validator';

describe('Candidate Insertion - Unit Tests', () => {
    
    // Reset mocks before each test
    beforeEach(() => {
        mockReset(prismaMock);
    });
    
    /**
     * Test Suite: addCandidate Service Function
     * Tests the main entry point for candidate creation
     */
    describe('addCandidate', () => {
        
        /**
         * Happy Path: Successful candidate insertion with all required fields
         */
        describe('Successful insertions', () => {
            
            it('should successfully insert a candidate with only required fields', async () => {
                // Arrange: Prepare minimal valid candidate data
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    address: 'Madrid, Spain'
                };

                const expectedCandidate = {
                    id: 1,
                    ...candidateData
                };

                // Mock Prisma create operation
                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify the candidate was created successfully
                expect(result).toEqual(expectedCandidate);
                expect(prismaMock.candidate.create).toHaveBeenCalledWith({
                    data: candidateData
                });
                expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
            });

            it('should successfully insert a candidate with education records', async () => {
                // Arrange: Candidate data with education history
                const candidateData = {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    phone: '687654321',
                    address: 'Barcelona, Spain',
                    educations: [
                        {
                            institution: 'Harvard University',
                            title: 'Computer Science',
                            startDate: '2015-09-01',
                            endDate: '2019-06-01'
                        }
                    ]
                };

                const savedCandidate = {
                    id: 2,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone,
                    address: candidateData.address
                };

                const savedEducation = {
                    id: 1,
                    institution: 'Harvard University',
                    title: 'Computer Science',
                    startDate: new Date('2015-09-01'),
                    endDate: new Date('2019-06-01'),
                    candidateId: 2
                };

                // Mock Prisma operations
                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.education.create.mockResolvedValue(savedEducation as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify candidate and education were created
                expect(result).toBeDefined();
                expect(result.id).toBe(2);
                expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.education.create).toHaveBeenCalledTimes(1);
            });

            it('should successfully insert a candidate with work experience records', async () => {
                // Arrange: Candidate data with work experience
                const candidateData = {
                    firstName: 'Bob',
                    lastName: 'Johnson',
                    email: 'bob.johnson@example.com',
                    phone: '698765432',
                    address: 'Valencia, Spain',
                    workExperiences: [
                        {
                            company: 'Tech Corp',
                            position: 'Senior Developer',
                            description: 'Full-stack development',
                            startDate: '2020-01-01',
                            endDate: '2023-12-31'
                        }
                    ]
                };

                const savedCandidate = {
                    id: 3,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone,
                    address: candidateData.address
                };

                const savedExperience = {
                    id: 1,
                    company: 'Tech Corp',
                    position: 'Senior Developer',
                    description: 'Full-stack development',
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2023-12-31'),
                    candidateId: 3
                };

                // Mock Prisma operations
                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.workExperience.create.mockResolvedValue(savedExperience as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify candidate and work experience were created
                expect(result).toBeDefined();
                expect(result.id).toBe(3);
                expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(1);
            });

            it('should successfully insert a candidate with resume/CV file', async () => {
                // Arrange: Candidate data with CV file
                const candidateData = {
                    firstName: 'Alice',
                    lastName: 'Williams',
                    email: 'alice.williams@example.com',
                    phone: '634567890',
                    address: 'Sevilla, Spain',
                    cv: {
                        filePath: '/uploads/alice_cv.pdf',
                        fileType: 'application/pdf'
                    }
                };

                const savedCandidate = {
                    id: 4,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone,
                    address: candidateData.address
                };

                const savedResume = {
                    id: 1,
                    filePath: '/uploads/alice_cv.pdf',
                    fileType: 'application/pdf',
                    uploadDate: new Date(),
                    candidateId: 4
                };

                // Mock Prisma operations
                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.resume.create.mockResolvedValue(savedResume as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify candidate and resume were created
                expect(result).toBeDefined();
                expect(result.id).toBe(4);
                expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.resume.create).toHaveBeenCalledTimes(1);
            });

            it('should successfully insert a complete candidate with all related entities', async () => {
                // Arrange: Complete candidate data with all relations
                const candidateData = {
                    firstName: 'Carlos',
                    lastName: 'García',
                    email: 'carlos.garcia@example.com',
                    phone: '645678901',
                    address: 'Bilbao, Spain',
                    educations: [
                        {
                            institution: 'MIT',
                            title: 'Software Engineering',
                            startDate: '2016-09-01',
                            endDate: '2020-06-01'
                        },
                        {
                            institution: 'Stanford',
                            title: 'Masters in AI',
                            startDate: '2020-09-01',
                            endDate: '2022-06-01'
                        }
                    ],
                    workExperiences: [
                        {
                            company: 'Google',
                            position: 'Software Engineer',
                            description: 'Backend development',
                            startDate: '2022-07-01',
                            endDate: null
                        }
                    ],
                    cv: {
                        filePath: '/uploads/carlos_cv.pdf',
                        fileType: 'application/pdf'
                    }
                };

                const savedCandidate = {
                    id: 5,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone,
                    address: candidateData.address
                };

                // Mock Prisma operations
                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.education.create.mockResolvedValue({ id: 1, candidateId: 5 } as any);
                prismaMock.workExperience.create.mockResolvedValue({ id: 1, candidateId: 5 } as any);
                prismaMock.resume.create.mockResolvedValue({ id: 1, candidateId: 5 } as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify all entities were created
                expect(result).toBeDefined();
                expect(result.id).toBe(5);
                expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.education.create).toHaveBeenCalledTimes(2);
                expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.resume.create).toHaveBeenCalledTimes(1);
            });
        });

        /**
         * Validation Tests: Invalid data handling
         */
        describe('Validation errors', () => {
            
            // Parametrized tests for invalid first names
            describe('Invalid firstName validation', () => {
                const invalidFirstNameCases = [
                    [undefined, 'should throw error when firstName is missing'],
                    ['', 'should throw error when firstName is empty string'],
                    ['a', 'should throw error when firstName is too short (less than 2 characters)'],
                    ['a'.repeat(101), 'should throw error when firstName exceeds 100 characters'],
                    ['John123', 'should throw error when firstName contains numbers'],
                    ['John@Doe', 'should throw error when firstName contains special characters']
                ];

                test.each(invalidFirstNameCases)(
                    '%s - %s',
                    async (invalidFirstName, description) => {
                        // Arrange: Invalid candidate data
                        const candidateData = {
                            firstName: invalidFirstName,
                            lastName: 'Doe',
                            email: 'test@example.com',
                            phone: '612345678'
                        };

                        // Act & Assert: Expect validation error
                        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid name');
                    }
                );
            });

            // Parametrized tests for invalid last names
            describe('Invalid lastName validation', () => {
                const invalidLastNameCases = [
                    [undefined, 'should throw error when lastName is missing'],
                    ['', 'should throw error when lastName is empty string'],
                    ['x', 'should throw error when lastName is too short (less than 2 characters)'],
                    ['x'.repeat(101), 'should throw error when lastName exceeds 100 characters'],
                    ['Smith99', 'should throw error when lastName contains numbers'],
                    ['Smith#Test', 'should throw error when lastName contains special characters']
                ];

                test.each(invalidLastNameCases)(
                    '%s - %s',
                    async (invalidLastName, description) => {
                        // Arrange: Invalid candidate data
                        const candidateData = {
                            firstName: 'John',
                            lastName: invalidLastName,
                            email: 'test@example.com',
                            phone: '612345678'
                        };

                        // Act & Assert: Expect validation error
                        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid name');
                    }
                );
            });

            // Parametrized tests for invalid emails
            describe('Invalid email validation', () => {
                const invalidEmailCases = [
                    [undefined, 'should throw error when email is missing'],
                    ['', 'should throw error when email is empty string'],
                    ['notanemail', 'should throw error for email without @ symbol'],
                    ['test@', 'should throw error for email without domain'],
                    ['@example.com', 'should throw error for email without local part'],
                    ['test@example', 'should throw error for email without TLD'],
                    ['test user@example.com', 'should throw error for email with spaces']
                ];

                test.each(invalidEmailCases)(
                    '%s - %s',
                    async (invalidEmail, description) => {
                        // Arrange: Invalid candidate data
                        const candidateData = {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: invalidEmail,
                            phone: '612345678'
                        };

                        // Act & Assert: Expect validation error
                        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid email');
                    }
                );
            });

            // Parametrized tests for invalid phone numbers
            describe('Invalid phone validation', () => {
                const invalidPhoneCases = [
                    ['12345', 'should throw error when phone has less than 9 digits'],
                    ['5123456789', 'should throw error when phone starts with invalid digit (not 6, 7, or 9)'],
                    ['61234567', 'should throw error when phone has only 8 digits'],
                    ['6123456789', 'should throw error when phone has more than 9 digits'],
                    ['61234567a', 'should throw error when phone contains letters'],
                    ['612 345 678', 'should throw error when phone contains spaces']
                ];

                test.each(invalidPhoneCases)(
                    '%s - %s',
                    async (invalidPhone, description) => {
                        // Arrange: Invalid candidate data
                        const candidateData = {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'test@example.com',
                            phone: invalidPhone
                        };

                        // Act & Assert: Expect validation error
                        await expect(addCandidate(candidateData)).rejects.toThrow('Invalid phone');
                    }
                );
            });

            it('should throw error when address exceeds maximum length', async () => {
                // Arrange: Candidate with too long address
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    address: 'x'.repeat(101) // Exceeds 100 character limit
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid address');
            });

            it('should throw error when education institution is missing', async () => {
                // Arrange: Education without required institution field
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: undefined,
                            title: 'Computer Science',
                            startDate: '2015-09-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid institution');
            });

            it('should throw error when education institution exceeds maximum length', async () => {
                // Arrange: Education with too long institution name
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: 'x'.repeat(101),
                            title: 'Computer Science',
                            startDate: '2015-09-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid institution');
            });

            it('should throw error when education title is missing', async () => {
                // Arrange: Education without required title field
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: 'Harvard',
                            title: undefined,
                            startDate: '2015-09-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid title');
            });

            it('should throw error when education startDate is invalid format', async () => {
                // Arrange: Education with invalid date format
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: 'Harvard',
                            title: 'Computer Science',
                            startDate: '2015/09/01' // Wrong format, should be YYYY-MM-DD
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid date');
            });

            it('should throw error when work experience company is missing', async () => {
                // Arrange: Work experience without required company field
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    workExperiences: [
                        {
                            company: undefined,
                            position: 'Developer',
                            startDate: '2020-01-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid company');
            });

            it('should throw error when work experience position is missing', async () => {
                // Arrange: Work experience without required position field
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    workExperiences: [
                        {
                            company: 'Tech Corp',
                            position: undefined,
                            startDate: '2020-01-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid position');
            });

            it('should throw error when work experience description exceeds maximum length', async () => {
                // Arrange: Work experience with too long description
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    workExperiences: [
                        {
                            company: 'Tech Corp',
                            position: 'Developer',
                            description: 'x'.repeat(201), // Exceeds 200 character limit
                            startDate: '2020-01-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid description');
            });

            it('should throw error when CV data is invalid (missing filePath)', async () => {
                // Arrange: CV without required filePath
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    cv: {
                        fileType: 'application/pdf'
                    }
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid CV data');
            });

            it('should throw error when CV data is invalid (missing fileType)', async () => {
                // Arrange: CV without required fileType
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    cv: {
                        filePath: '/uploads/cv.pdf'
                    }
                };

                // Act & Assert: Expect validation error
                await expect(addCandidate(candidateData)).rejects.toThrow('Invalid CV data');
            });
        });

        /**
         * Database Constraint Tests: Unique constraints and database errors
         */
        describe('Database constraint errors', () => {
            
            it('should throw specific error when email already exists (P2002 unique constraint)', async () => {
                // Arrange: Candidate data with duplicate email
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'duplicate@example.com',
                    phone: '612345678'
                };

                // Mock Prisma to throw unique constraint error
                const prismaError: any = new Error('Unique constraint failed');
                prismaError.code = 'P2002';
                prismaMock.candidate.create.mockRejectedValue(prismaError);

                // Act & Assert: Expect specific error message for duplicate email
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'The email already exists in the database'
                );
            });

            it('should throw database connection error when Prisma cannot connect', async () => {
                // Arrange: Valid candidate data but database is unavailable
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678'
                };

                // Mock Prisma initialization error
                const initError = new Prisma.PrismaClientInitializationError(
                    'Cannot connect to database',
                    'connectionError' as any
                );
                prismaMock.candidate.create.mockRejectedValue(initError);

                // Act & Assert: Expect database connection error (Prisma throws the error directly)
                await expect(addCandidate(candidateData)).rejects.toThrow(
                    'Cannot connect to database'
                );
            });
        });

        /**
         * Edge Cases: Optional fields and boundary conditions
         */
        describe('Edge cases and optional fields', () => {
            
            it('should successfully insert candidate without optional phone', async () => {
                // Arrange: Candidate without phone number
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    address: 'Madrid, Spain'
                };

                const expectedCandidate = {
                    id: 1,
                    ...candidateData,
                    phone: null
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify candidate was created without phone
                expect(result).toBeDefined();
                expect(result.phone).toBeNull();
            });

            it('should successfully insert candidate without optional address', async () => {
                // Arrange: Candidate without address
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678'
                };

                const expectedCandidate = {
                    id: 1,
                    ...candidateData,
                    address: null
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify candidate was created without address
                expect(result).toBeDefined();
                expect(result.address).toBeNull();
            });

            it('should successfully insert candidate with empty educations array', async () => {
                // Arrange: Candidate with empty educations
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    educations: []
                };

                const expectedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify no education records were attempted
                expect(result).toBeDefined();
                expect(prismaMock.education.create).not.toHaveBeenCalled();
            });

            it('should successfully insert candidate with empty workExperiences array', async () => {
                // Arrange: Candidate with empty work experiences
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    workExperiences: []
                };

                const expectedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify no work experience records were attempted
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.create).not.toHaveBeenCalled();
            });

            it('should not insert CV when cv object is empty', async () => {
                // Arrange: Candidate with empty CV object
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    cv: {}
                };

                const expectedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify no resume was created
                expect(result).toBeDefined();
                expect(prismaMock.resume.create).not.toHaveBeenCalled();
            });

            it('should handle education with null endDate (ongoing education)', async () => {
                // Arrange: Education without end date (still studying)
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: 'MIT',
                            title: 'PhD in Computer Science',
                            startDate: '2023-09-01',
                            endDate: null
                        }
                    ]
                };

                const savedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                const savedEducation = {
                    id: 1,
                    institution: 'MIT',
                    title: 'PhD in Computer Science',
                    startDate: new Date('2023-09-01'),
                    endDate: null,
                    candidateId: 1
                };

                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.education.create.mockResolvedValue(savedEducation as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify education was created with null endDate
                expect(result).toBeDefined();
                expect(prismaMock.education.create).toHaveBeenCalledTimes(1);
            });

            it('should handle work experience with null endDate (current job)', async () => {
                // Arrange: Work experience without end date (currently employed)
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    workExperiences: [
                        {
                            company: 'Microsoft',
                            position: 'Senior Engineer',
                            description: 'Cloud development',
                            startDate: '2022-01-01',
                            endDate: null
                        }
                    ]
                };

                const savedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                const savedExperience = {
                    id: 1,
                    company: 'Microsoft',
                    position: 'Senior Engineer',
                    description: 'Cloud development',
                    startDate: new Date('2022-01-01'),
                    endDate: null,
                    candidateId: 1
                };

                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.workExperience.create.mockResolvedValue(savedExperience as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify work experience was created with null endDate
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(1);
            });

            it('should handle multiple education records for the same candidate', async () => {
                // Arrange: Candidate with multiple education records
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: 'University of Madrid',
                            title: 'Bachelor in Computer Science',
                            startDate: '2014-09-01',
                            endDate: '2018-06-01'
                        },
                        {
                            institution: 'MIT',
                            title: 'Master in AI',
                            startDate: '2018-09-01',
                            endDate: '2020-06-01'
                        },
                        {
                            institution: 'Stanford',
                            title: 'PhD in Machine Learning',
                            startDate: '2020-09-01',
                            endDate: '2024-06-01'
                        }
                    ]
                };

                const savedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.education.create.mockResolvedValue({ id: 1, candidateId: 1 } as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify all education records were created
                expect(result).toBeDefined();
                expect(prismaMock.education.create).toHaveBeenCalledTimes(3);
            });

            it('should handle multiple work experience records for the same candidate', async () => {
                // Arrange: Candidate with multiple work experiences
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    workExperiences: [
                        {
                            company: 'StartupX',
                            position: 'Junior Developer',
                            description: 'Web development',
                            startDate: '2018-07-01',
                            endDate: '2020-06-30'
                        },
                        {
                            company: 'TechCorp',
                            position: 'Mid-level Developer',
                            description: 'Backend systems',
                            startDate: '2020-07-01',
                            endDate: '2022-12-31'
                        },
                        {
                            company: 'BigTech Inc',
                            position: 'Senior Developer',
                            description: 'Architecture design',
                            startDate: '2023-01-01',
                            endDate: null
                        }
                    ]
                };

                const savedCandidate = {
                    id: 1,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.phone
                };

                prismaMock.candidate.create.mockResolvedValue(savedCandidate as any);
                prismaMock.workExperience.create.mockResolvedValue({ id: 1, candidateId: 1 } as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify all work experience records were created
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(3);
            });
        });

        /**
         * Special Characters and International Support
         */
        describe('Special characters and international names', () => {
            
            it('should accept names with Spanish characters (ñ, accents)', async () => {
                // Arrange: Candidate with Spanish characters
                const candidateData = {
                    firstName: 'José',
                    lastName: 'Peña',
                    email: 'jose.pena@example.com',
                    phone: '612345678'
                };

                const expectedCandidate = {
                    id: 1,
                    ...candidateData
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify names with accents are accepted
                expect(result).toBeDefined();
                expect(result.firstName).toBe('José');
                expect(result.lastName).toBe('Peña');
            });

            it('should accept names with uppercase Ñ', async () => {
                // Arrange: Candidate with uppercase Ñ
                const candidateData = {
                    firstName: 'IÑAKI',
                    lastName: 'NUÑEZ',
                    email: 'inaki.nunez@example.com',
                    phone: '612345678'
                };

                const expectedCandidate = {
                    id: 1,
                    ...candidateData
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify uppercase Ñ is accepted
                expect(result).toBeDefined();
                expect(result.firstName).toBe('IÑAKI');
            });

            it('should accept compound names with spaces', async () => {
                // Arrange: Candidate with compound names
                const candidateData = {
                    firstName: 'María José',
                    lastName: 'García López',
                    email: 'maria.garcia@example.com',
                    phone: '612345678'
                };

                const expectedCandidate = {
                    id: 1,
                    ...candidateData
                };

                prismaMock.candidate.create.mockResolvedValue(expectedCandidate as any);

                // Act: Execute candidate insertion
                const result = await addCandidate(candidateData);

                // Assert: Verify compound names are accepted
                expect(result).toBeDefined();
                expect(result.firstName).toBe('María José');
                expect(result.lastName).toBe('García López');
            });
        });
    });

    /**
     * Test Suite: Candidate Model
     * Tests the Candidate model's save method directly
     */
    describe('Candidate Model', () => {
        
        describe('save method', () => {
            
            it('should create a new candidate when id is not provided', async () => {
                // Arrange: New candidate without id
                const candidateData = {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test.user@example.com',
                    phone: '612345678',
                    address: 'Test Address'
                };

                const expectedResult = {
                    id: 1,
                    ...candidateData
                };

                prismaMock.candidate.create.mockResolvedValue(expectedResult as any);

                const candidate = new Candidate(candidateData);

                // Act: Save the candidate
                const result = await candidate.save();

                // Assert: Verify create was called
                expect(result).toEqual(expectedResult);
                expect(prismaMock.candidate.create).toHaveBeenCalledTimes(1);
                expect(prismaMock.candidate.update).not.toHaveBeenCalled();
            });

            it('should update an existing candidate when id is provided', async () => {
                // Arrange: Existing candidate with id
                const candidateData = {
                    id: 1,
                    firstName: 'Updated',
                    lastName: 'User',
                    email: 'updated.user@example.com',
                    phone: '687654321',
                    address: 'Updated Address'
                };

                const expectedResult = {
                    ...candidateData
                };

                prismaMock.candidate.update.mockResolvedValue(expectedResult as any);

                const candidate = new Candidate(candidateData);

                // Act: Save the candidate (update)
                const result = await candidate.save();

                // Assert: Verify update was called
                expect(result).toEqual(expectedResult);
                expect(prismaMock.candidate.update).toHaveBeenCalledWith({
                    where: { id: 1 },
                    data: expect.objectContaining({
                        firstName: 'Updated',
                        lastName: 'User'
                    })
                });
                expect(prismaMock.candidate.create).not.toHaveBeenCalled();
            });

            it('should only include defined fields in the save operation', async () => {
                // Arrange: Candidate with some undefined fields
                const candidateData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com'
                    // phone and address are undefined
                };

                prismaMock.candidate.create.mockResolvedValue({ id: 1, ...candidateData } as any);

                const candidate = new Candidate(candidateData);

                // Act: Save the candidate
                await candidate.save();

                // Assert: Verify only defined fields were included
                expect(prismaMock.candidate.create).toHaveBeenCalledWith({
                    data: {
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@example.com'
                    }
                });
            });

            it('should throw P2025 error when updating non-existent candidate', async () => {
                // Arrange: Update attempt for non-existent candidate
                const candidateData = {
                    id: 999,
                    firstName: 'NonExistent',
                    lastName: 'User',
                    email: 'nonexistent@example.com'
                };

                const prismaError: any = new Error('Record not found');
                prismaError.code = 'P2025';
                prismaMock.candidate.update.mockRejectedValue(prismaError);

                const candidate = new Candidate(candidateData);

                // Act & Assert: Expect error for non-existent record
                await expect(candidate.save()).rejects.toThrow(
                    'No se pudo encontrar el registro del candidato con el ID proporcionado'
                );
            });
        });

        describe('findOne static method', () => {
            
            it('should return a Candidate instance when found', async () => {
                // Arrange: Mock successful find
                const mockData = {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    address: 'Madrid'
                };

                prismaMock.candidate.findUnique.mockResolvedValue(mockData as any);

                // Act: Find candidate by id
                const result = await Candidate.findOne(1);

                // Assert: Verify candidate was found and returned as instance
                expect(result).toBeInstanceOf(Candidate);
                expect(result?.id).toBe(1);
                expect(result?.email).toBe('john.doe@example.com');
                expect(prismaMock.candidate.findUnique).toHaveBeenCalledWith({
                    where: { id: 1 }
                });
            });

            it('should return null when candidate not found', async () => {
                // Arrange: Mock unsuccessful find
                prismaMock.candidate.findUnique.mockResolvedValue(null);

                // Act: Find non-existent candidate
                const result = await Candidate.findOne(999);

                // Assert: Verify null is returned
                expect(result).toBeNull();
                expect(prismaMock.candidate.findUnique).toHaveBeenCalledWith({
                    where: { id: 999 }
                });
            });
        });
    });

    /**
     * Test Suite: Education Model
     * Tests the Education model's save method
     */
    describe('Education Model', () => {
        
        describe('save method', () => {
            
            it('should create a new education record', async () => {
                // Arrange: New education without id
                const educationData = {
                    institution: 'Harvard',
                    title: 'Computer Science',
                    startDate: '2015-09-01',
                    endDate: '2019-06-01',
                    candidateId: 1
                };

                const expectedResult = {
                    id: 1,
                    ...educationData,
                    startDate: new Date('2015-09-01'),
                    endDate: new Date('2019-06-01')
                };

                prismaMock.education.create.mockResolvedValue(expectedResult as any);

                const education = new Education(educationData);

                // Act: Save the education
                const result = await education.save();

                // Assert: Verify education was created
                expect(result).toBeDefined();
                expect(prismaMock.education.create).toHaveBeenCalledTimes(1);
            });

            it('should update an existing education record', async () => {
                // Arrange: Existing education with id
                const educationData = {
                    id: 1,
                    institution: 'MIT',
                    title: 'Updated Title',
                    startDate: '2015-09-01',
                    endDate: '2019-06-01',
                    candidateId: 1
                };

                const expectedResult = {
                    ...educationData,
                    startDate: new Date('2015-09-01'),
                    endDate: new Date('2019-06-01')
                };

                prismaMock.education.update.mockResolvedValue(expectedResult as any);

                const education = new Education(educationData);

                // Act: Save the education (update)
                const result = await education.save();

                // Assert: Verify education was updated
                expect(result).toBeDefined();
                expect(prismaMock.education.update).toHaveBeenCalledWith({
                    where: { id: 1 },
                    data: expect.any(Object)
                });
            });

            it('should handle education without endDate', async () => {
                // Arrange: Education without end date
                const educationData = {
                    institution: 'Stanford',
                    title: 'PhD',
                    startDate: '2023-09-01',
                    candidateId: 1
                };

                const expectedResult = {
                    id: 1,
                    ...educationData,
                    startDate: new Date('2023-09-01'),
                    endDate: undefined
                };

                prismaMock.education.create.mockResolvedValue(expectedResult as any);

                const education = new Education(educationData);

                // Act: Save the education
                const result = await education.save();

                // Assert: Verify education was created without endDate
                expect(result).toBeDefined();
                expect(prismaMock.education.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        institution: 'Stanford',
                        endDate: undefined
                    })
                });
            });
        });
    });

    /**
     * Test Suite: WorkExperience Model
     * Tests the WorkExperience model's save method
     */
    describe('WorkExperience Model', () => {
        
        describe('save method', () => {
            
            it('should create a new work experience record', async () => {
                // Arrange: New work experience without id
                const experienceData = {
                    company: 'Google',
                    position: 'Software Engineer',
                    description: 'Backend development',
                    startDate: '2020-01-01',
                    endDate: '2023-12-31',
                    candidateId: 1
                };

                const expectedResult = {
                    id: 1,
                    ...experienceData,
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2023-12-31')
                };

                prismaMock.workExperience.create.mockResolvedValue(expectedResult as any);

                const workExperience = new WorkExperience(experienceData);

                // Act: Save the work experience
                const result = await workExperience.save();

                // Assert: Verify work experience was created
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.create).toHaveBeenCalledTimes(1);
            });

            it('should update an existing work experience record', async () => {
                // Arrange: Existing work experience with id
                const experienceData = {
                    id: 1,
                    company: 'Microsoft',
                    position: 'Senior Engineer',
                    description: 'Cloud systems',
                    startDate: '2020-01-01',
                    endDate: '2023-12-31',
                    candidateId: 1
                };

                const expectedResult = {
                    ...experienceData,
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2023-12-31')
                };

                prismaMock.workExperience.update.mockResolvedValue(expectedResult as any);

                const workExperience = new WorkExperience(experienceData);

                // Act: Save the work experience (update)
                const result = await workExperience.save();

                // Assert: Verify work experience was updated
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.update).toHaveBeenCalledWith({
                    where: { id: 1 },
                    data: expect.any(Object)
                });
            });

            it('should handle work experience without description', async () => {
                // Arrange: Work experience without description
                const experienceData = {
                    company: 'Amazon',
                    position: 'Developer',
                    startDate: '2021-01-01',
                    candidateId: 1
                };

                const expectedResult = {
                    id: 1,
                    ...experienceData,
                    startDate: new Date('2021-01-01'),
                    description: undefined
                };

                prismaMock.workExperience.create.mockResolvedValue(expectedResult as any);

                const workExperience = new WorkExperience(experienceData);

                // Act: Save the work experience
                const result = await workExperience.save();

                // Assert: Verify work experience was created without description
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        company: 'Amazon',
                        description: undefined
                    })
                });
            });

            it('should handle work experience without endDate (current position)', async () => {
                // Arrange: Work experience without end date
                const experienceData = {
                    company: 'Apple',
                    position: 'Lead Developer',
                    description: 'iOS development',
                    startDate: '2022-01-01',
                    candidateId: 1
                };

                const expectedResult = {
                    id: 1,
                    ...experienceData,
                    startDate: new Date('2022-01-01'),
                    endDate: undefined
                };

                prismaMock.workExperience.create.mockResolvedValue(expectedResult as any);

                const workExperience = new WorkExperience(experienceData);

                // Act: Save the work experience
                const result = await workExperience.save();

                // Assert: Verify work experience was created without endDate
                expect(result).toBeDefined();
                expect(prismaMock.workExperience.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        company: 'Apple',
                        endDate: undefined
                    })
                });
            });
        });
    });

    /**
     * Test Suite: Resume Model
     * Tests the Resume model's save and create methods
     */
    describe('Resume Model', () => {
        
        describe('save and create methods', () => {
            
            it('should create a new resume record', async () => {
                // Arrange: New resume without id
                const resumeData = {
                    filePath: '/uploads/resume.pdf',
                    fileType: 'application/pdf',
                    candidateId: 1
                };

                const expectedResult = {
                    id: 1,
                    ...resumeData,
                    uploadDate: expect.any(Date)
                };

                prismaMock.resume.create.mockResolvedValue(expectedResult as any);

                const resume = new Resume(resumeData);

                // Act: Save the resume
                const result = await resume.save();

                // Assert: Verify resume was created
                expect(result).toBeDefined();
                expect(prismaMock.resume.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        candidateId: 1,
                        filePath: '/uploads/resume.pdf',
                        fileType: 'application/pdf',
                        uploadDate: expect.any(Date)
                    })
                });
            });

            it('should throw error when trying to update an existing resume', async () => {
                // Arrange: Resume with id (update attempt)
                const resumeData = {
                    id: 1,
                    filePath: '/uploads/resume.pdf',
                    fileType: 'application/pdf',
                    candidateId: 1
                };

                const resume = new Resume(resumeData);

                // Act & Assert: Expect error for update attempt
                await expect(resume.save()).rejects.toThrow(
                    'No se permite la actualización de un currículum existente'
                );
            });

            it('should automatically set uploadDate on creation', async () => {
                // Arrange: New resume
                const resumeData = {
                    filePath: '/uploads/new_resume.pdf',
                    fileType: 'application/pdf',
                    candidateId: 1
                };

                const mockResult = {
                    id: 1,
                    ...resumeData,
                    uploadDate: new Date()
                };

                prismaMock.resume.create.mockResolvedValue(mockResult as any);

                const resume = new Resume(resumeData);

                // Act: Save the resume
                const result = await resume.save();

                // Assert: Verify uploadDate was set
                expect(result).toBeDefined();
                expect(prismaMock.resume.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        uploadDate: expect.any(Date)
                    })
                });
            });
        });
    });

    /**
     * Test Suite: Validator Functions
     * Tests the validation logic in isolation
     */
    describe('Validator', () => {
        
        describe('validateCandidateData', () => {
            
            it('should pass validation for valid candidate data', () => {
                // Arrange: Valid candidate data
                const validData = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '612345678',
                    address: 'Madrid, Spain'
                };

                // Act & Assert: Expect no errors
                expect(() => validateCandidateData(validData)).not.toThrow();
            });

            it('should skip validation when id is provided (edit mode)', () => {
                // Arrange: Candidate data with id (edit scenario)
                const editData = {
                    id: 1,
                    firstName: '', // Invalid but should be skipped
                    lastName: '',  // Invalid but should be skipped
                    email: 'invalid' // Invalid but should be skipped
                };

                // Act & Assert: Expect no errors when editing
                expect(() => validateCandidateData(editData)).not.toThrow();
            });

            it('should validate all fields when id is not provided', () => {
                // Arrange: Invalid new candidate data
                const invalidData = {
                    firstName: '', // Invalid
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678'
                };

                // Act & Assert: Expect validation error
                expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
            });

            it('should validate all education records when provided', () => {
                // Arrange: Data with invalid education
                const dataWithInvalidEducation = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    educations: [
                        {
                            institution: '', // Invalid
                            title: 'Computer Science',
                            startDate: '2015-09-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error for education
                expect(() => validateCandidateData(dataWithInvalidEducation)).toThrow('Invalid institution');
            });

            it('should validate all work experience records when provided', () => {
                // Arrange: Data with invalid work experience
                const dataWithInvalidExperience = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    workExperiences: [
                        {
                            company: 'Tech Corp',
                            position: '', // Invalid
                            startDate: '2020-01-01'
                        }
                    ]
                };

                // Act & Assert: Expect validation error for work experience
                expect(() => validateCandidateData(dataWithInvalidExperience)).toThrow('Invalid position');
            });

            it('should validate CV data when provided', () => {
                // Arrange: Data with invalid CV
                const dataWithInvalidCV = {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'test@example.com',
                    phone: '612345678',
                    cv: {
                        filePath: '/uploads/cv.pdf'
                        // Missing fileType
                    }
                };

                // Act & Assert: Expect validation error for CV
                expect(() => validateCandidateData(dataWithInvalidCV)).toThrow('Invalid CV data');
            });
        });
    });
});
