# Testing Guide: Candidate Insertion Functionality

## 1. Overview

### Purpose of the Tests
This testing guide covers the candidate insertion functionality in the ATS (Applicant Tracking System). The tests ensure:
- **Data integrity**: All candidate data is properly validated before processing
- **Business logic correctness**: The candidate service correctly orchestrates validation and persistence
- **Error handling**: Edge cases and errors are handled gracefully
- **Database operations**: Candidates and related entities are correctly persisted

### Testing Approach
We use **unit tests with mocking** to isolate components and test them independently:
- **Validator tests**: Pure function testing without mocks
- **Service tests**: Mock the Candidate model and related models
- **Model tests**: Mock Prisma Client to test database interactions

---

## 2. Test Categories

### A. Data Validation Tests (Form Data Reception)

#### firstName Validation
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-FN-001 | Valid first name | `"John"` | Pass |
| VAL-FN-002 | Valid name with accents | `"José María"` | Pass |
| VAL-FN-003 | Valid name with ñ | `"Íñigo"` | Pass |
| VAL-FN-004 | Empty first name | `""` | Throw "Invalid name" |
| VAL-FN-005 | Null first name | `null` | Throw "Invalid name" |
| VAL-FN-006 | Undefined first name | `undefined` | Throw "Invalid name" |
| VAL-FN-007 | Name too short (1 char) | `"J"` | Throw "Invalid name" |
| VAL-FN-008 | Name at minimum length (2 chars) | `"Jo"` | Pass |
| VAL-FN-009 | Name at maximum length (100 chars) | `"A".repeat(100)` | Pass |
| VAL-FN-010 | Name exceeds max length (101 chars) | `"A".repeat(101)` | Throw "Invalid name" |
| VAL-FN-011 | Name with numbers | `"John123"` | Throw "Invalid name" |
| VAL-FN-012 | Name with special characters | `"John@Doe"` | Throw "Invalid name" |

#### lastName Validation
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-LN-001 | Valid last name | `"Doe"` | Pass |
| VAL-LN-002 | Valid name with accents | `"García López"` | Pass |
| VAL-LN-003 | Empty last name | `""` | Throw "Invalid name" |
| VAL-LN-004 | Null last name | `null` | Throw "Invalid name" |
| VAL-LN-005 | Last name too short | `"D"` | Throw "Invalid name" |
| VAL-LN-006 | Last name at minimum length | `"Do"` | Pass |
| VAL-LN-007 | Last name at maximum length | `"A".repeat(100)` | Pass |
| VAL-LN-008 | Last name exceeds max length | `"A".repeat(101)` | Throw "Invalid name" |
| VAL-LN-009 | Last name with numbers | `"Doe123"` | Throw "Invalid name" |

#### email Validation
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-EM-001 | Valid email | `"john@example.com"` | Pass |
| VAL-EM-002 | Valid email with subdomain | `"john@mail.example.com"` | Pass |
| VAL-EM-003 | Valid email with numbers | `"john123@example.com"` | Pass |
| VAL-EM-004 | Valid email with dots | `"john.doe@example.com"` | Pass |
| VAL-EM-005 | Valid email with plus | `"john+test@example.com"` | Pass |
| VAL-EM-006 | Empty email | `""` | Throw "Invalid email" |
| VAL-EM-007 | Null email | `null` | Throw "Invalid email" |
| VAL-EM-008 | Email without @ | `"johnexample.com"` | Throw "Invalid email" |
| VAL-EM-009 | Email without domain | `"john@"` | Throw "Invalid email" |
| VAL-EM-010 | Email without TLD | `"john@example"` | Throw "Invalid email" |
| VAL-EM-011 | Email with invalid TLD (1 char) | `"john@example.c"` | Throw "Invalid email" |
| VAL-EM-012 | Email with spaces | `"john @example.com"` | Throw "Invalid email" |

#### phone Validation (Optional Field)
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-PH-001 | Valid mobile starting with 6 | `"612345678"` | Pass |
| VAL-PH-002 | Valid mobile starting with 7 | `"712345678"` | Pass |
| VAL-PH-003 | Valid landline starting with 9 | `"912345678"` | Pass |
| VAL-PH-004 | Empty phone (optional) | `""` | Pass |
| VAL-PH-005 | Null phone (optional) | `null` | Pass |
| VAL-PH-006 | Undefined phone (optional) | `undefined` | Pass |
| VAL-PH-007 | Phone too short (8 digits) | `"61234567"` | Throw "Invalid phone" |
| VAL-PH-008 | Phone too long (10 digits) | `"6123456789"` | Throw "Invalid phone" |
| VAL-PH-009 | Phone starting with invalid digit | `"812345678"` | Throw "Invalid phone" |
| VAL-PH-010 | Phone with letters | `"61234567a"` | Throw "Invalid phone" |
| VAL-PH-011 | Phone with spaces | `"612 345 678"` | Throw "Invalid phone" |
| VAL-PH-012 | Phone with country code | `"+34612345678"` | Throw "Invalid phone" |

#### address Validation (Optional Field)
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-AD-001 | Valid address | `"123 Main St"` | Pass |
| VAL-AD-002 | Empty address (optional) | `""` | Pass |
| VAL-AD-003 | Null address (optional) | `null` | Pass |
| VAL-AD-004 | Undefined address (optional) | `undefined` | Pass |
| VAL-AD-005 | Address at max length (100 chars) | `"A".repeat(100)` | Pass |
| VAL-AD-006 | Address exceeds max length | `"A".repeat(101)` | Throw "Invalid address" |

#### education Array Validation
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-ED-001 | Valid education entry | `{institution: "MIT", title: "CS", startDate: "2020-01-01"}` | Pass |
| VAL-ED-002 | Education with end date | `{institution: "MIT", title: "CS", startDate: "2020-01-01", endDate: "2024-01-01"}` | Pass |
| VAL-ED-003 | Empty educations array | `[]` | Pass |
| VAL-ED-004 | Missing institution | `{title: "CS", startDate: "2020-01-01"}` | Throw "Invalid institution" |
| VAL-ED-005 | Empty institution | `{institution: "", title: "CS", startDate: "2020-01-01"}` | Throw "Invalid institution" |
| VAL-ED-006 | Institution exceeds max length | `{institution: "A".repeat(101), ...}` | Throw "Invalid institution" |
| VAL-ED-007 | Missing title | `{institution: "MIT", startDate: "2020-01-01"}` | Throw "Invalid title" |
| VAL-ED-008 | Empty title | `{institution: "MIT", title: "", startDate: "2020-01-01"}` | Throw "Invalid title" |
| VAL-ED-009 | Title exceeds max length | `{institution: "MIT", title: "A".repeat(101), ...}` | Throw "Invalid title" |
| VAL-ED-010 | Missing start date | `{institution: "MIT", title: "CS"}` | Throw "Invalid date" |
| VAL-ED-011 | Invalid start date format | `{..., startDate: "01-01-2020"}` | Throw "Invalid date" |
| VAL-ED-012 | Invalid end date format | `{..., endDate: "2024/01/01"}` | Throw "Invalid end date" |
| VAL-ED-013 | Multiple valid educations | `[edu1, edu2]` | Pass |

#### workExperience Array Validation
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-WE-001 | Valid work experience | `{company: "Google", position: "Dev", startDate: "2020-01-01"}` | Pass |
| VAL-WE-002 | Work experience with description | `{..., description: "Backend development"}` | Pass |
| VAL-WE-003 | Work experience with end date | `{..., endDate: "2024-01-01"}` | Pass |
| VAL-WE-004 | Empty work experiences array | `[]` | Pass |
| VAL-WE-005 | Missing company | `{position: "Dev", startDate: "2020-01-01"}` | Throw "Invalid company" |
| VAL-WE-006 | Empty company | `{company: "", position: "Dev", ...}` | Throw "Invalid company" |
| VAL-WE-007 | Company exceeds max length | `{company: "A".repeat(101), ...}` | Throw "Invalid company" |
| VAL-WE-008 | Missing position | `{company: "Google", startDate: "2020-01-01"}` | Throw "Invalid position" |
| VAL-WE-009 | Empty position | `{company: "Google", position: "", ...}` | Throw "Invalid position" |
| VAL-WE-010 | Position exceeds max length | `{..., position: "A".repeat(101)}` | Throw "Invalid position" |
| VAL-WE-011 | Description exceeds max length | `{..., description: "A".repeat(201)}` | Throw "Invalid description" |
| VAL-WE-012 | Missing start date | `{company: "Google", position: "Dev"}` | Throw "Invalid date" |
| VAL-WE-013 | Invalid start date format | `{..., startDate: "2020-1-1"}` | Throw "Invalid date" |
| VAL-WE-014 | Invalid end date format | `{..., endDate: "invalid"}` | Throw "Invalid end date" |

#### cv Object Validation
| Test ID | Description | Input | Expected Result |
|---------|-------------|-------|-----------------|
| VAL-CV-001 | Valid CV object | `{filePath: "/uploads/cv.pdf", fileType: "pdf"}` | Pass |
| VAL-CV-002 | Empty CV object (optional) | `{}` | Pass |
| VAL-CV-003 | Null CV (optional) | `null` | Pass |
| VAL-CV-004 | Undefined CV (optional) | `undefined` | Pass |
| VAL-CV-005 | CV missing filePath | `{fileType: "pdf"}` | Throw "Invalid CV data" |
| VAL-CV-006 | CV missing fileType | `{filePath: "/uploads/cv.pdf"}` | Throw "Invalid CV data" |
| VAL-CV-007 | CV with non-string filePath | `{filePath: 123, fileType: "pdf"}` | Throw "Invalid CV data" |
| VAL-CV-008 | CV with non-string fileType | `{filePath: "/path", fileType: 123}` | Throw "Invalid CV data" |
| VAL-CV-009 | CV as non-object | `"cv.pdf"` | Throw "Invalid CV data" |

---

### B. Database Operation Tests

#### Successful Candidate Creation
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DB-CR-001 | Create candidate with required fields only | Returns saved candidate with ID |
| DB-CR-002 | Create candidate with all optional fields | Returns saved candidate with all fields |
| DB-CR-003 | Create candidate with one education | Returns candidate, education saved |
| DB-CR-004 | Create candidate with multiple educations | All educations saved with correct candidateId |
| DB-CR-005 | Create candidate with one work experience | Returns candidate, experience saved |
| DB-CR-006 | Create candidate with multiple work experiences | All experiences saved with correct candidateId |
| DB-CR-007 | Create candidate with CV | Returns candidate, resume saved |
| DB-CR-008 | Create candidate with all related entities | All entities saved correctly |

#### Handling Duplicate Email Errors
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DB-DUP-001 | Create candidate with existing email | Throws "The email already exists in the database" |
| DB-DUP-002 | Prisma P2002 error code is caught | Error message is user-friendly |

#### Saving Related Entities
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DB-REL-001 | Education receives correct candidateId | Education saved with parent candidate's ID |
| DB-REL-002 | Work experience receives correct candidateId | Experience saved with parent candidate's ID |
| DB-REL-003 | Resume receives correct candidateId | Resume saved with parent candidate's ID |
| DB-REL-004 | Multiple educations saved sequentially | All educations have correct candidateId |

#### Error Handling Scenarios
| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| DB-ERR-001 | Database connection error | Throws connection error message |
| DB-ERR-002 | Validation error before save | Transaction never started |
| DB-ERR-003 | Unknown Prisma error | Error is re-thrown |
| DB-ERR-004 | Update non-existent candidate (P2025) | Throws "record not found" message |

---

## 3. Mocking Strategy

### How to Mock Prisma Client

```typescript
// __mocks__/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  Prisma: {
    PrismaClientInitializationError: class PrismaClientInitializationError extends Error {}
  }
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
```

### Alternative: Manual Mock

```typescript
// In test file
const mockPrismaClient = {
  candidate: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  education: {
    create: jest.fn(),
  },
  workExperience: {
    create: jest.fn(),
  },
  resume: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));
```

### What to Mock vs What to Test

| Component | Mock | Test |
|-----------|------|------|
| `validator.ts` | Nothing | Pure function logic |
| `candidateService.ts` | Candidate, Education, WorkExperience, Resume models | Orchestration logic, error handling |
| `Candidate.ts` | PrismaClient | Data mapping, Prisma calls |
| `Education.ts` | PrismaClient | Data mapping, Prisma calls |
| `WorkExperience.ts` | PrismaClient | Data mapping, Prisma calls |
| `Resume.ts` | PrismaClient | Data mapping, Prisma calls |

### Mock Examples for Service Tests

```typescript
// Mock the Candidate model
jest.mock('../../domain/models/Candidate', () => ({
  Candidate: jest.fn().mockImplementation((data) => ({
    ...data,
    education: [],
    workExperience: [],
    resumes: [],
    save: jest.fn().mockResolvedValue({ id: 1, ...data }),
  })),
}));

// Mock Education model
jest.mock('../../domain/models/Education', () => ({
  Education: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ id: 1, ...data }),
  })),
}));
```

---

## 4. Test File Structure

### Recommended Organization

```
backend/
├── src/
│   ├── application/
│   │   ├── validator.ts
│   │   └── services/
│   │       └── candidateService.ts
│   ├── domain/
│   │   └── models/
│   │       ├── Candidate.ts
│   │       ├── Education.ts
│   │       ├── WorkExperience.ts
│   │       └── Resume.ts
│   └── tests/
│       ├── unit/
│       │   ├── validator.test.ts          # Validation tests (VAL-*)
│       │   ├── candidateService.test.ts   # Service tests (DB-*)
│       │   └── models/
│       │       ├── Candidate.test.ts      # Model-specific tests
│       │       ├── Education.test.ts
│       │       ├── WorkExperience.test.ts
│       │       └── Resume.test.ts
│       ├── integration/
│       │   └── candidate.integration.test.ts
│       └── __mocks__/
│           └── prisma.ts
```

### Naming Conventions

| Convention | Example |
|------------|---------|
| Test file suffix | `*.test.ts` |
| Test suite description | `describe('validateCandidateData', () => {...})` |
| Test case description | `it('should throw error for invalid email', () => {...})` |
| Test ID in comments | `// VAL-EM-008` |

### Test File Template

```typescript
// validator.test.ts
import { validateCandidateData } from '../application/validator';

describe('validateCandidateData', () => {
  // Helper to create valid candidate data
  const createValidCandidate = (overrides = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    ...overrides,
  });

  describe('firstName validation', () => {
    it('should pass with valid first name', () => {
      // VAL-FN-001
      const data = createValidCandidate({ firstName: 'John' });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should throw error for empty first name', () => {
      // VAL-FN-004
      const data = createValidCandidate({ firstName: '' });
      expect(() => validateCandidateData(data)).toThrow('Invalid name');
    });
  });

  // ... more test suites
});
```

---

## 5. Sample Test Cases Table

### Complete Test Case Reference

| Test ID | Category | Description | Input Summary | Expected Result |
|---------|----------|-------------|---------------|-----------------|
| VAL-FN-001 | Validation | Valid first name | `"John"` | Pass |
| VAL-FN-004 | Validation | Empty first name | `""` | Throw "Invalid name" |
| VAL-FN-007 | Validation | Name too short | `"J"` | Throw "Invalid name" |
| VAL-FN-010 | Validation | Name too long | 101 chars | Throw "Invalid name" |
| VAL-FN-011 | Validation | Name with numbers | `"John123"` | Throw "Invalid name" |
| VAL-LN-001 | Validation | Valid last name | `"Doe"` | Pass |
| VAL-LN-003 | Validation | Empty last name | `""` | Throw "Invalid name" |
| VAL-EM-001 | Validation | Valid email | `"john@example.com"` | Pass |
| VAL-EM-008 | Validation | Email without @ | `"johnexample.com"` | Throw "Invalid email" |
| VAL-PH-001 | Validation | Valid Spanish mobile | `"612345678"` | Pass |
| VAL-PH-004 | Validation | Empty phone (optional) | `""` | Pass |
| VAL-PH-009 | Validation | Invalid phone prefix | `"812345678"` | Throw "Invalid phone" |
| VAL-AD-001 | Validation | Valid address | `"123 Main St"` | Pass |
| VAL-AD-006 | Validation | Address too long | 101 chars | Throw "Invalid address" |
| VAL-ED-001 | Validation | Valid education | Complete object | Pass |
| VAL-ED-004 | Validation | Education missing institution | Partial object | Throw "Invalid institution" |
| VAL-WE-001 | Validation | Valid work experience | Complete object | Pass |
| VAL-WE-005 | Validation | Experience missing company | Partial object | Throw "Invalid company" |
| VAL-CV-001 | Validation | Valid CV | `{filePath, fileType}` | Pass |
| VAL-CV-005 | Validation | CV missing filePath | `{fileType}` | Throw "Invalid CV data" |
| DB-CR-001 | Database | Create with required fields | Minimal candidate | Returns saved candidate |
| DB-CR-008 | Database | Create with all entities | Full candidate | All entities saved |
| DB-DUP-001 | Database | Duplicate email | Existing email | Throw duplicate error |
| DB-ERR-001 | Database | Connection error | N/A | Throw connection error |

---

## 6. Running the Tests

### Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- validator.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="firstName"

# Run tests in watch mode
npm test -- --watch
```

### Expected Coverage Targets

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| validator.ts | >90% | >85% | >90% | >90% |
| candidateService.ts | >85% | >80% | >90% | >85% |
| Candidate.ts | >80% | >75% | >85% | >80% |

---

## 7. Edge Cases and Special Considerations

### Edit Mode (id provided)
When `data.id` is provided, validation is skipped. This should be tested:
- VAL-EDIT-001: Providing id bypasses all validation
- VAL-EDIT-002: Update with invalid data when id is present (passes validation)

### Spanish Character Support
The name regex supports Spanish characters:
- `ñÑ` - Spanish ñ
- `áéíóúÁÉÍÓÚ` - Accented vowels

### Phone Number Format
Only Spanish phone formats are valid:
- `6XXXXXXXX` - Mobile
- `7XXXXXXXX` - Mobile
- `9XXXXXXXX` - Landline

### Date Format
Dates must follow `YYYY-MM-DD` format (ISO 8601 date).
