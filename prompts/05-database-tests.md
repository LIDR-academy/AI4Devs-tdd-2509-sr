# Prompt 05: Test Implementation - Database Operations

## Objective
Implement unit tests for database saving operations, covering the "database saving" test family required by Activity 2. This includes mocking Prisma Client.

## Prompt

```
I need to add database operation tests to the existing test file. These tests cover the "database saving" test family.

First, read these files:
- backend/src/application/services/candidateService.ts - the addCandidate function
- backend/src/domain/models/Candidate.ts - the save method
- backend/prisma/schema.prisma - understand the data model

Now I need to:

1. Create a Prisma mock file at `backend/src/tests/__mocks__/prisma.ts`:
```typescript
// Mock Prisma Client for testing
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Export mocked prisma client
export const prismaMock = mockDeep<PrismaClient>();

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
```

2. Install jest-mock-extended if not present:
   `npm install --save-dev jest-mock-extended`

3. Add database tests to `backend/src/tests/tests-iniciales.test.ts`:

```typescript
describe('Candidate Database Operations', () => {
  // Test successful candidate creation and save
  // Test handling of duplicate email (Prisma P2002 error)
  // Test saving candidate with education records
  // Test saving candidate with work experience records
  // Test error handling when database fails
});
```

Requirements:
1. Mock the Prisma client to avoid actual database operations
2. Test the addCandidate service function
3. Verify that the save method is called with correct data
4. Test error scenarios (duplicate email, database errors)
5. Use Jest's mock functions to verify calls

Test cases must include at minimum:
- Successfully creates and saves a new candidate
- Returns error when email already exists (duplicate)
- Saves candidate with related education data
- Handles database connection errors gracefully

IMPORTANT:
- Mock the Prisma client, don't connect to real database
- Use jest.mock() to mock the modules
- Verify mock functions were called with expected parameters

Add these tests to the existing tests-iniciales.test.ts file (append to the validation tests from Prompt 04).

Output:
- Updated test file with database tests
- The prisma mock file content
- Summary of all test cases in the file
```

## Expected Output

- `backend/src/tests/__mocks__/prisma.ts` - Prisma mock
- Updated `backend/src/tests/tests-iniciales.test.ts` with database tests
- Summary of all test cases
