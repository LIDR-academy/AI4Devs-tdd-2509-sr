# Project Analysis Output

## Project Architecture Summary

This is a full-stack application with a **frontend/backend** architecture:

### Backend (Node.js/Express/TypeScript)
```
backend/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── src/
│   ├── application/
│   │   ├── services/
│   │   │   ├── candidateService.ts    # Business logic for candidates
│   │   │   └── fileUploadService.ts   # File upload handling
│   │   └── validator.ts               # Input validation logic
│   ├── domain/
│   │   └── models/
│   │       ├── Candidate.ts           # Candidate entity model
│   │       ├── Education.ts           # Education entity model
│   │       ├── WorkExperience.ts      # Work experience entity model
│   │       └── Resume.ts              # Resume entity model
│   ├── presentation/
│   │   └── controllers/
│   │       └── candidateController.ts # HTTP request handlers
│   ├── routes/
│   │   └── candidateRoutes.ts         # API route definitions
│   └── index.ts                       # Application entry point
```

### Frontend (React/TypeScript)
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── AddCandidateForm.js
│   │   ├── FileUploader.js
│   │   └── RecruiterDashboard.js
│   └── services/
│       └── candidateService.js
```

### Database
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Container**: Docker (docker-compose.yml)

---

## Candidate Insertion Flow

### 1. Controller Layer ([candidateController.ts](backend/src/presentation/controllers/candidateController.ts))
- Receives HTTP POST request with candidate data
- Calls `addCandidate` service function
- Returns 201 on success, 400 on error

### 2. Service Layer ([candidateService.ts](backend/src/application/services/candidateService.ts))
The `addCandidate` function:
1. **Validates** candidate data using `validateCandidateData()`
2. **Creates** a new `Candidate` instance
3. **Saves** the candidate to database
4. **Saves related entities** (if provided):
   - Education records
   - Work experience records
   - Resume/CV files
5. **Handles errors**:
   - Unique constraint violation (P2002) → "The email already exists"
   - Other database errors

### 3. Domain Layer ([Candidate.ts](backend/src/domain/models/Candidate.ts))
The `Candidate` class:
- Encapsulates candidate data
- `save()` method handles both create and update operations
- Uses Prisma client for database operations
- Handles database connection errors and record not found errors

### 4. Data Flow
```
HTTP Request → Controller → Service → Validator → Domain Model → Prisma → PostgreSQL
```

---

## Validation Rules (from [validator.ts](backend/src/application/validator.ts))

### Field Validations

| Field | Rules | Regex/Length |
|-------|-------|--------------|
| **firstName** | Required, 2-100 chars, only letters (including Spanish chars) and spaces | `/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/` |
| **lastName** | Required, 2-100 chars, only letters (including Spanish chars) and spaces | `/^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/` |
| **email** | Required, valid email format | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| **phone** | Optional, Spanish format (starts with 6, 7, or 9, 9 digits total) | `/^(6\|7\|9)\d{8}$/` |
| **address** | Optional, max 100 chars | Length ≤ 100 |

### Date Format
All dates must match: `/^\d{4}-\d{2}-\d{2}$/` (YYYY-MM-DD)

### Education Validation
- `institution`: Required, max 100 chars
- `title`: Required, max 100 chars
- `startDate`: Required, valid date format
- `endDate`: Optional, valid date format if provided

### Work Experience Validation
- `company`: Required, max 100 chars
- `position`: Required, max 100 chars
- `description`: Optional, max 200 chars
- `startDate`: Required, valid date format
- `endDate`: Optional, valid date format if provided

### CV Validation
- Must be an object
- Must have `filePath` (string)
- Must have `fileType` (string)

### Special Case
If `data.id` is provided, validation is skipped (editing existing candidate).

---

## Key Functions to Test

### 1. Validator Functions ([validator.ts](backend/src/application/validator.ts))
- `validateName(name)` - Name validation with regex and length
- `validateEmail(email)` - Email format validation
- `validatePhone(phone)` - Spanish phone number validation
- `validateDate(date)` - Date format validation
- `validateAddress(address)` - Address length validation
- `validateEducation(education)` - Education object validation
- `validateExperience(experience)` - Work experience validation
- `validateCV(cv)` - CV/Resume object validation
- `validateCandidateData(data)` - Main orchestration function

### 2. Service Functions ([candidateService.ts](backend/src/application/services/candidateService.ts))
- `addCandidate(candidateData)` - Main candidate creation flow
  - Success path with full data
  - Success path with minimal data
  - Validation error handling
  - Duplicate email handling (P2002)
  - Database error handling

### 3. Domain Model ([Candidate.ts](backend/src/domain/models/Candidate.ts))
- `Candidate.constructor(data)` - Proper initialization
- `Candidate.save()` - Create and update operations
- `Candidate.findOne(id)` - Find by ID
- Error handling for database connection issues

### 4. Controller ([candidateController.ts](backend/src/presentation/controllers/candidateController.ts))
- `addCandidateController(req, res)` - HTTP request handling
  - Success response (201)
  - Error response (400)

---

## Current Test-Related Dependencies

### Already Installed (in devDependencies)
```json
{
  "@types/jest": "^29.5.13",    // TypeScript types for Jest
  "jest": "^29.7.0",            // Jest testing framework
  "ts-jest": "^29.2.5"          // Jest transformer for TypeScript
}
```

### Existing Test Script
```json
{
  "test": "jest"
}
```

### Missing Configuration
- **No `jest.config.js`** or `jest.config.ts` file found
- **No test files** found in the project
- **No mocking utilities** installed (e.g., jest-mock-extended for Prisma mocking)

### Recommended Additional Dependencies
For comprehensive testing, consider adding:
- `@types/supertest` + `supertest` - For HTTP endpoint testing
- `jest-mock-extended` - For mocking Prisma client
- Or use manual mocking of Prisma

---

## Database Schema Summary

### Candidate Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | Primary Key, Auto-increment |
| firstName | VarChar(100) | Required |
| lastName | VarChar(100) | Required |
| email | VarChar(255) | Required, Unique |
| phone | VarChar(15) | Optional |
| address | VarChar(100) | Optional |

### Education Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | Primary Key, Auto-increment |
| institution | VarChar(100) | Required |
| title | VarChar(250) | Required |
| startDate | DateTime | Required |
| endDate | DateTime | Optional |
| candidateId | Int | Foreign Key → Candidate |

### WorkExperience Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | Primary Key, Auto-increment |
| company | VarChar(100) | Required |
| position | VarChar(100) | Required |
| description | VarChar(200) | Optional |
| startDate | DateTime | Required |
| endDate | DateTime | Optional |
| candidateId | Int | Foreign Key → Candidate |

### Resume Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | Primary Key, Auto-increment |
| filePath | VarChar(500) | Required |
| fileType | VarChar(50) | Required |
| uploadDate | DateTime | Required |
| candidateId | Int | Foreign Key → Candidate |

---

## Next Steps

1. **Configure Jest** with TypeScript support (jest.config.ts)
2. **Set up Prisma mocking** for database layer tests
3. **Write unit tests** for:
   - Validator functions (highest priority - pure functions)
   - Service functions (with mocked dependencies)
   - Domain models (with mocked Prisma client)
4. **Write integration tests** for the full candidate insertion flow
