import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create a mock Prisma client
export const mockPrisma = mockDeep<PrismaClient>();

// Reset mocks before each test
beforeEach(() => {
  mockReset(mockPrisma);
});

export type MockPrisma = DeepMockProxy<PrismaClient>;

