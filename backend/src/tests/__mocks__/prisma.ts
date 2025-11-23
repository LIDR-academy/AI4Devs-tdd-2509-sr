// Mock Prisma Client for testing
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Export mocked prisma client
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
