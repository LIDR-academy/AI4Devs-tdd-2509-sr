# Change: Add Unit Test Suite for Candidate Insertion

## Why
Currently, the candidate insertion functionality lacks unit test coverage. This makes it difficult to verify that the system correctly handles form data validation and database persistence. Adding comprehensive unit tests will improve code reliability, catch regressions early, and document expected behavior.

## What Changes
- Add Jest unit tests for candidate controller (`candidateController.ts`) to verify form data handling
- Add Jest unit tests for candidate service (`candidateService.ts`) to verify database persistence logic
- Add test utilities and mocks for Prisma Client to enable isolated testing
- Configure test environment with proper TypeScript and Jest setup
- Add at least one test case for each of the two main test families:
  1. Receiving and validating data from the form (controller layer)
  2. Saving candidate data to the database (service/model layer)

## Impact
- **Affected specs**: New capability `candidate-testing` for test specifications
- **Affected code**: 
  - `backend/src/presentation/controllers/candidateController.ts` - Will have test coverage
  - `backend/src/application/services/candidateService.ts` - Will have test coverage
  - `backend/src/domain/models/Candidate.ts` - May need test coverage for save() method
  - New test files: `backend/src/**/*.test.ts` or `backend/src/**/__tests__/*.test.ts`
- **Testing infrastructure**: Jest configuration may need updates for mocking Prisma Client

