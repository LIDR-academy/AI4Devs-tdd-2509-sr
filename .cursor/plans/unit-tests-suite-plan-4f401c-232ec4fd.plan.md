<!-- 232ec4fd-81b0-483b-bdc8-ed50df9f3ed5 43a05439-86fb-472e-bb43-996e31576776 -->
# Unit Tests Suite Plan for Insert Candidate Feature

## Overview

Create comprehensive unit tests for all backend components involved in the "insert candidate to database" feature. Tests will be organized into two main families and written in `backend/src/tests/tests-JEK.test.ts` using ts-jest.

## Components to Test

### Presentation Layer

1. **`backend/src/routes/candidateRoutes.ts`**

   - Route handler for POST `/candidates`
   - HTTP status code responses (201, 400, 500)
   - Error handling and response formatting

2. **`backend/src/presentation/controllers/candidateController.ts`**

   - `addCandidateController` function
   - Request/response handling
   - Error transformation

### Application Layer

3. **`backend/src/application/services/candidateService.ts`**

   - `addCandidate` function
   - Orchestration logic
   - Error handling (P2002 duplicate email)
   - Related entities creation flow

4. **`backend/src/application/validator.ts`**

   - `validateCandidateData` function
   - Individual validation functions (validateName, validateEmail, validatePhone, validateDate, validateAddress, validateEducation, validateExperience, validateCV)
   - Edge cases and boundary conditions

5. **`backend/src/application/services/fileUploadService.ts`**

   - `uploadFile` function
   - File type validation (PDF, DOCX)
   - File size limits (10MB)
   - Multer error handling

### Domain Layer

6. **`backend/src/domain/models/Candidate.ts`**

   - Constructor initialization
   - `save()` method (create operation)
   - `findOne()` static method
   - Prisma error handling (P2025, connection errors)
   - Nested entity creation

7. **`backend/src/domain/models/Education.ts`**

   - Constructor initialization
   - `save()` method (create and update)
   - Date conversion logic

8. **`backend/src/domain/models/WorkExperience.ts`**

   - Constructor initialization
   - `save()` method (create and update)
   - Date conversion logic

9. **`backend/src/domain/models/Resume.ts`**

   - Constructor initialization
   - `save()` method (immutability enforcement)
   - `create()` method
   - Upload date assignment

## Test Structure

### Test File Location

- **File**: `backend/src/tests/tests-JEK.test.ts`

### Test Organization

#### Family 1: Form Data Retrieval Tests

Tests focused on data validation, parsing, and transformation before persistence.

**1.1 Validator Tests (`validator.ts`)**

- Valid candidate data scenarios
- Invalid candidate data scenarios (all fields)
- Edge cases (boundary values, special characters, Spanish characters)
- Education validation (valid/invalid institution, title, dates)
- Work experience validation (valid/invalid company, position, description, dates)
- CV validation (valid/invalid filePath, fileType)
- Empty/optional fields handling
- Array validation (educations, workExperiences)

**1.2 File Upload Service Tests (`fileUploadService.ts`)**

- Valid file upload (PDF, DOCX)
- Invalid file type rejection
- File size limit enforcement (10MB)
- Multer error handling
- Missing file handling
- Response format validation

**1.3 Controller Tests (`candidateController.ts`)**

- Request body extraction
- Response formatting (201 status, JSON structure)
- Error response formatting (400 status, error message structure)
- Unknown error handling

**1.4 Route Handler Tests (`candidateRoutes.ts`)**

- Successful request handling (201 status)
- Validation error handling (400 status)
- Unexpected error handling (500 status)
- Request body forwarding

#### Family 2: Data Persistence Tests

Tests focused on database operations with mocked Prisma Client.

**2.1 Candidate Model Tests (`Candidate.ts`)**

- Constructor initialization with all fields
- Constructor initialization with optional fields
- `save()` method - create new candidate (mocked Prisma create)
- `save()` method - update existing candidate (mocked Prisma update)
- `save()` method - nested entities creation (educations, workExperiences, resumes)
- `save()` method - Prisma error handling (P2025, connection errors)
- `findOne()` static method - successful retrieval
- `findOne()` static method - not found (null return)
- `findOne()` static method - Prisma error handling

**2.2 Education Model Tests (`Education.ts`)**

- Constructor initialization
- Date conversion (string to Date)
- `save()` method - create new education (mocked Prisma create)
- `save()` method - update existing education (mocked Prisma update)
- CandidateId assignment

**2.3 WorkExperience Model Tests (`WorkExperience.ts`)**

- Constructor initialization
- Date conversion (string to Date)
- `save()` method - create new work experience (mocked Prisma create)
- `save()` method - update existing work experience (mocked Prisma update)
- CandidateId assignment
- Optional description handling

**2.4 Resume Model Tests (`Resume.ts`)**

- Constructor initialization
- Upload date auto-assignment
- `save()` method - create new resume (mocked Prisma create)
- `save()` method - immutability enforcement (throws error on update attempt)
- `create()` method - successful creation
- CandidateId requirement

**2.5 Candidate Service Tests (`candidateService.ts`)**

- Complete flow: validation → candidate creation → related entities creation
- Validation error propagation
- Candidate creation with educations
- Candidate creation with work experiences
- Candidate creation with CV
- Candidate creation with all related entities
- Duplicate email error handling (P2002)
- Database error propagation
- Empty related entities arrays handling

## Mocking Strategy

### Prisma Client Mocking

- Mock `@prisma/client` module
- Mock `PrismaClient` instance methods:
  - `prisma.candidate.create()`
  - `prisma.candidate.update()`
  - `prisma.candidate.findUnique()`
  - `prisma.education.create()`
  - `prisma.education.update()`
  - `prisma.workExperience.create()`
  - `prisma.workExperience.update()`
  - `prisma.resume.create()`
- Mock Prisma error types:
  - `PrismaClientKnownRequestError` (P2002, P2025)
  - `PrismaClientInitializationError`

### Express Request/Response Mocking

- Mock Express `Request` and `Response` objects
- Mock `req.body`, `req.file`
- Mock `res.status()`, `res.send()`, `res.json()`

### Multer Mocking

- Mock `multer` module
- Mock MulterError instances
- Mock file upload middleware behavior

## Test Data Fixtures

### Valid Candidate Data

```typescript
const validCandidateData = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '612345678',
  address: 'Calle Principal 123',
  educations: [...],
  workExperiences: [...],
  cv: {...}
}
```

### Invalid Candidate Data Variants

- Missing required fields
- Invalid formats (email, phone, dates)
- Boundary violations (length limits)
- Invalid characters

## Implementation Notes

1. **Database Mocking**: All database operations must use mocked Prisma Client - no real database connections
2. **Test Isolation**: Each test should be independent with proper setup/teardown
3. **Error Scenarios**: Test both success and error paths for all components
4. **Edge Cases**: Include boundary conditions, null/undefined handling, empty arrays
5. **Type Safety**: Leverage TypeScript types in test assertions
6. **Coverage**: Aim for comprehensive coverage of all code paths

## Dependencies Required

- `jest` (already in package.json)
- `ts-jest` (already in package.json)
- `@types/jest` (already in package.json)
- Mock utilities: `jest.mock()` for module mocking

## Test Execution

Tests will be run using:

```bash
nvm use v20.19.5
npm test
```

The test file will be automatically discovered by Jest based on the pattern `**/tests/**/*.test.ts` or explicit path configuration.

### To-dos

- [ ] Create test file structure in backend/src/tests/tests-JEK.test.ts with imports, mocks setup, and test data fixtures
- [ ] Implement Family 1.1: Validator tests (validateCandidateData and all individual validation functions) - valid/invalid scenarios, edge cases, boundary conditions
- [ ] Implement Family 1.2: File upload service tests (uploadFile function) - valid/invalid file types, size limits, Multer error handling
- [ ] Implement Family 1.3: Controller tests (addCandidateController) - request/response handling, error formatting
- [ ] Implement Family 1.4: Route handler tests (candidateRoutes) - HTTP status codes, error handling
- [ ] Set up Prisma Client mocking infrastructure for all domain model tests (Candidate, Education, WorkExperience, Resume)
- [ ] Implement Family 2.1: Candidate model tests (constructor, save, findOne) with mocked Prisma operations
- [ ] Implement Family 2.2: Education model tests (constructor, save) with mocked Prisma operations
- [ ] Implement Family 2.3: WorkExperience model tests (constructor, save) with mocked Prisma operations
- [ ] Implement Family 2.4: Resume model tests (constructor, save, create) with mocked Prisma operations
- [ ] Implement Family 2.5: Candidate service tests (addCandidate) - complete flow, error handling, related entities creation