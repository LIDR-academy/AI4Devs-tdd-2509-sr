# LTI - Talent Tracking System Architecture Documentation

## Executive Summary

LTI (Talent Tracking System) is a full-stack Applicant Tracking System (ATS) designed to manage candidate recruitment workflows. The system follows a layered architecture pattern with clear separation of concerns between presentation, application, and domain layers. Built with modern web technologies, it provides a RESTful API backend and a responsive React frontend for candidate management.

---

## 1. System Overview

### 1.1 Purpose
LTI is an ATS system that enables recruiters to:
- Register and manage candidate profiles
- Store candidate education history
- Track work experience
- Upload and manage CV/resume documents
- Validate candidate data according to business rules

### 1.2 Technology Stack

**Backend:**
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Language**: TypeScript 4.9.5
- **ORM**: Prisma 5.13.0
- **Database**: PostgreSQL (via Docker)
- **File Upload**: Multer 1.4.5-lts.1
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Testing**: Jest 29.7.0 with ts-jest

**Frontend:**
- **Framework**: React 18.3.1
- **Language**: JavaScript/TypeScript (hybrid)
- **Routing**: React Router DOM 6.23.1
- **UI Library**: React Bootstrap 2.10.2, Bootstrap 5.3.3
- **Date Picker**: react-datepicker 6.9.0
- **HTTP Client**: Fetch API / Axios
- **Testing**: Jest with React Testing Library

**Infrastructure:**
- **Containerization**: Docker Compose
- **Database**: PostgreSQL (containerized)
- **Build Tools**: TypeScript Compiler, Create React App

---

## 2. Architecture Pattern

### 2.1 Layered Architecture

The system follows a **Layered Architecture** pattern (also known as N-Tier Architecture) with the following layers:

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (Controllers, Routes)             │
├─────────────────────────────────────┤
│   Application Layer                 │
│   (Services, Validators)           │
├─────────────────────────────────────┤
│   Domain Layer                      │
│   (Business Models)                 │
├─────────────────────────────────────┤
│   Infrastructure Layer              │
│   (Prisma ORM, Database)           │
└─────────────────────────────────────┘
```

### 2.2 Architectural Principles

1. **Separation of Concerns**: Each layer has a distinct responsibility
2. **Dependency Inversion**: Upper layers depend on abstractions from lower layers
3. **Single Responsibility**: Each module/class has one clear purpose
4. **DRY (Don't Repeat Yourself)**: Validation and business logic centralized

---

## 3. Backend Architecture

### 3.1 Directory Structure

```
backend/
├── src/
│   ├── index.ts                      # Application entry point
│   ├── domain/                       # Domain Layer
│   │   └── models/                   # Domain entities
│   │       ├── Candidate.ts
│   │       ├── Education.ts
│   │       ├── WorkExperience.ts
│   │       └── Resume.ts
│   ├── application/                  # Application Layer
│   │   ├── services/                 # Business logic services
│   │   │   ├── candidateService.ts
│   │   │   └── fileUploadService.ts
│   │   └── validator.ts              # Input validation
│   ├── presentation/                 # Presentation Layer
│   │   └── controllers/              # Request handlers
│   │       └── candidateController.ts
│   ├── routes/                       # Route definitions
│   │   └── candidateRoutes.ts
│   └── __tests__/                    # Test files
├── prisma/                           # Database schema
│   └── schema.prisma
├── dist/                             # Compiled JavaScript
└── package.json
```

### 3.2 Layer Responsibilities

#### 3.2.1 Presentation Layer (`presentation/`)

**Purpose**: Handle HTTP requests/responses and route definitions

**Components:**
- **Controllers** (`candidateController.ts`): Process HTTP requests, invoke services, format responses
- **Routes** (`candidateRoutes.ts`): Define API endpoints and map to controllers

**Key Characteristics:**
- Thin controllers that delegate to application services
- Error handling and HTTP status code management
- Request/response transformation

**Example Flow:**
```typescript
Route → Controller → Service → Domain Model → Database
```

#### 3.2.2 Application Layer (`application/`)

**Purpose**: Orchestrate business logic and coordinate domain models

**Components:**
- **Services** (`candidateService.ts`, `fileUploadService.ts`): Business logic orchestration
- **Validators** (`validator.ts`): Input validation and business rule enforcement

**Key Responsibilities:**
- Transaction coordination
- Data validation before persistence
- Error handling and transformation
- Cross-cutting concerns (logging, etc.)

**Patterns Used:**
- **Service Layer Pattern**: Encapsulates business logic
- **Validation Layer**: Centralized validation rules

#### 3.2.3 Domain Layer (`domain/models/`)

**Purpose**: Represent business entities and their behavior

**Components:**
- **Domain Models**: `Candidate`, `Education`, `WorkExperience`, `Resume`

**Key Characteristics:**
- **Active Record Pattern**: Models contain persistence logic (`save()` methods)
- Business logic encapsulation
- Domain invariants enforcement

**Model Relationships:**
```
Candidate (1) ──< (N) Education
Candidate (1) ──< (N) WorkExperience
Candidate (1) ──< (N) Resume
```

#### 3.2.4 Infrastructure Layer

**Purpose**: Provide technical capabilities (database access, file storage)

**Components:**
- **Prisma ORM**: Database abstraction
- **Multer**: File upload handling
- **Express Middleware**: Request processing

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌──────────────┐
│  Candidate   │
├──────────────┤
│ id (PK)      │
│ firstName    │
│ lastName     │
│ email (UK)   │
│ phone        │
│ address      │
└──────┬───────┘
       │
       │ 1:N
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Education   │  │WorkExperience│
├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │
│ candidateId  │  │ candidateId  │
│ institution  │  │ company      │
│ title        │  │ position     │
│ startDate    │  │ description  │
│ endDate      │  │ startDate    │
└──────────────┘  │ endDate      │
                  └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│   Resume     │
├──────────────┤
│ id (PK)      │
│ candidateId  │
│ filePath     │
│ fileType     │
│ uploadDate   │
└──────────────┘
```

### 4.2 Domain Entities

#### 4.2.1 Candidate
- **Primary Key**: `id` (auto-increment integer)
- **Unique Constraint**: `email`
- **Required Fields**: `firstName`, `lastName`, `email`
- **Optional Fields**: `phone`, `address`
- **Relationships**: One-to-many with Education, WorkExperience, Resume

#### 4.2.2 Education
- **Primary Key**: `id`
- **Foreign Key**: `candidateId` → Candidate.id
- **Required Fields**: `institution`, `title`, `startDate`
- **Optional Fields**: `endDate` (for ongoing education)

#### 4.2.3 WorkExperience
- **Primary Key**: `id`
- **Foreign Key**: `candidateId` → Candidate.id
- **Required Fields**: `company`, `position`, `startDate`
- **Optional Fields**: `description`, `endDate` (for current positions)

#### 4.2.4 Resume
- **Primary Key**: `id`
- **Foreign Key**: `candidateId` → Candidate.id
- **Required Fields**: `filePath`, `fileType`, `uploadDate`
- **Business Rule**: Immutable after creation (no updates allowed)

### 4.3 Database Schema (Prisma)

```prisma
model Candidate {
  id                Int               @id @default(autoincrement())
  firstName         String            @db.VarChar(100)
  lastName          String            @db.VarChar(100)
  email             String            @unique @db.VarChar(255)
  phone             String?           @db.VarChar(15)
  address           String?           @db.VarChar(100)
  educations        Education[]
  workExperiences   WorkExperience[]
  resumes           Resume[]
}
```

**Key Design Decisions:**
- Email uniqueness enforced at database level
- Variable-length strings with appropriate limits
- Nullable fields for optional data
- Cascade relationships managed by Prisma

---

## 5. API Design

### 5.1 RESTful API Endpoints

#### POST `/candidates`
**Purpose**: Create a new candidate profile

**Request Body:**
```json
{
  "firstName": "string (2-100 chars, letters only)",
  "lastName": "string (2-100 chars, letters only)",
  "email": "string (valid email format)",
  "phone": "string (9 digits, starts with 6/7/9)",
  "address": "string (max 100 chars, optional)",
  "educations": [
    {
      "institution": "string (max 100 chars)",
      "title": "string (max 100 chars)",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD (optional)"
    }
  ],
  "workExperiences": [
    {
      "company": "string (max 100 chars)",
      "position": "string (max 100 chars)",
      "description": "string (max 200 chars, optional)",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD (optional)"
    }
  ],
  "cv": {
    "filePath": "string",
    "fileType": "string (MIME type)"
  }
}
```

**Response:**
- `201 Created`: Candidate created successfully
- `400 Bad Request`: Validation error or duplicate email
- `500 Internal Server Error`: Server error

#### POST `/upload`
**Purpose**: Upload a CV/resume file

**Request:** `multipart/form-data` with `file` field

**Constraints:**
- Allowed types: PDF (`application/pdf`), DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- Max file size: 10MB
- Storage: `../uploads/` directory

**Response:**
```json
{
  "filePath": "string (relative path)",
  "fileType": "string (MIME type)"
}
```

### 5.2 API Specification

The API follows OpenAPI 3.0 specification defined in `backend/api-spec.yaml`. Key features:
- Request/response schemas
- Validation rules
- Error responses
- Content types

---

## 6. Validation Rules

### 6.1 Input Validation

The system implements comprehensive validation at the application layer (`application/validator.ts`):

#### 6.1.1 Name Validation
- **Pattern**: `^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$` (letters, spaces, Spanish characters)
- **Length**: 2-100 characters
- **Applies to**: `firstName`, `lastName`

#### 6.1.2 Email Validation
- **Pattern**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Uniqueness**: Enforced at database level
- **Required**: Yes

#### 6.1.3 Phone Validation
- **Pattern**: `^(6|7|9)\d{8}$` (Spanish mobile format)
- **Length**: 9 digits
- **Required**: No

#### 6.1.4 Date Validation
- **Format**: `YYYY-MM-DD` (`^\d{4}-\d{2}-\d{2}$`)
- **Applies to**: `startDate`, `endDate` in Education and WorkExperience

#### 6.1.5 Address Validation
- **Max Length**: 100 characters
- **Required**: No

#### 6.1.6 Education Validation
- `institution`: Required, max 100 chars
- `title`: Required, max 100 chars
- `startDate`: Required, valid date format
- `endDate`: Optional, valid date format

#### 6.1.7 Work Experience Validation
- `company`: Required, max 100 chars
- `position`: Required, max 100 chars
- `description`: Optional, max 200 chars
- `startDate`: Required, valid date format
- `endDate`: Optional, valid date format

#### 6.1.8 CV Validation
- `filePath`: Required string
- `fileType`: Required string (MIME type)
- File type validation: PDF or DOCX only
- File size: Max 10MB

### 6.2 Validation Flow

```
HTTP Request
    ↓
Route Handler
    ↓
Controller
    ↓
Validator (validateCandidateData)
    ↓
Service Layer
    ↓
Domain Model
    ↓
Database (Prisma)
```

**Validation Strategy:**
- **Fail-fast**: Validation occurs before any database operations
- **Centralized**: All validation logic in `validator.ts`
- **Reusable**: Validation functions can be composed

---

## 7. Frontend Architecture

### 7.1 Component Structure

```
frontend/src/
├── App.js                    # Root component with routing
├── components/
│   ├── RecruiterDashboard.js # Main dashboard
│   ├── AddCandidateForm.js   # Candidate registration form
│   └── FileUploader.js       # File upload component
└── services/
    └── candidateService.js   # API client
```

### 7.2 Component Patterns

#### 7.2.1 Container/Presentational Pattern
- **Containers**: `AddCandidateForm` (manages state and business logic)
- **Presentational**: `FileUploader` (focused on UI)

#### 7.2.2 State Management
- **Local State**: React `useState` hook
- **Form State**: Controlled components pattern
- **No Global State**: No Redux/Context (simple use case)

### 7.3 Routing

**Routes:**
- `/` → `RecruiterDashboard`
- `/add-candidate` → `AddCandidateForm`

**Router**: React Router DOM v6

### 7.4 API Integration

**Pattern**: Service layer abstraction
- `candidateService.js`: Encapsulates API calls
- Uses Fetch API and Axios
- Error handling at component level

**API Base URL**: `http://localhost:3010`

---

## 8. Design Patterns

### 8.1 Backend Patterns

#### 8.1.1 Active Record Pattern
**Location**: Domain models (`Candidate.ts`, `Education.ts`, etc.)

**Characteristics:**
- Models encapsulate data and persistence logic
- `save()` method handles create/update
- Direct database access via Prisma

**Example:**
```typescript
const candidate = new Candidate(data);
await candidate.save(); // Persists to database
```

#### 8.1.2 Service Layer Pattern
**Location**: `application/services/`

**Purpose:**
- Encapsulate business logic
- Coordinate multiple domain models
- Transaction management

**Example:**
```typescript
addCandidate() {
  1. Validate input
  2. Create Candidate
  3. Create related Education records
  4. Create related WorkExperience records
  5. Create Resume record
}
```

#### 8.1.3 Repository Pattern (via Prisma)
**Location**: Prisma Client

**Characteristics:**
- Prisma Client acts as repository abstraction
- Database-agnostic queries
- Type-safe database access

#### 8.1.4 Middleware Pattern
**Location**: Express middleware

**Examples:**
- CORS middleware
- JSON parsing middleware
- Prisma client injection middleware
- Error handling middleware

### 8.2 Frontend Patterns

#### 8.2.1 Controlled Components
**Location**: Form components

**Characteristics:**
- React controls form state
- Single source of truth
- Validation on change

#### 8.2.2 Service Abstraction
**Location**: `services/candidateService.js`

**Purpose:**
- Decouple components from API details
- Centralize API configuration
- Reusable API calls

---

## 9. Error Handling

### 9.1 Backend Error Handling

#### 9.1.1 Error Types

1. **Validation Errors**
   - **Source**: `validator.ts`
   - **HTTP Status**: 400 Bad Request
   - **Response**: `{ message: string, error: string }`

2. **Database Errors**
   - **P2002**: Unique constraint violation (duplicate email)
   - **P2025**: Record not found
   - **PrismaClientInitializationError**: Database connection failure

3. **File Upload Errors**
   - Invalid file type: 400 Bad Request
   - File size exceeded: 500 Internal Server Error
   - Multer errors: 500 Internal Server Error

4. **Generic Errors**
   - **HTTP Status**: 500 Internal Server Error
   - **Response**: Generic error message

#### 9.1.2 Error Handling Flow

```
Controller
    ↓ (try/catch)
Service Layer
    ↓ (throws Error)
Domain Model
    ↓ (throws Prisma errors)
Error Middleware
    ↓
HTTP Response
```

**Error Middleware:**
```typescript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### 9.2 Frontend Error Handling

**Pattern**: Try-catch in async handlers

**User Feedback:**
- Error alerts via React Bootstrap `Alert` component
- Success messages for successful operations
- Loading states during async operations

---

## 10. Security Considerations

### 10.1 Current Security Measures

1. **Input Validation**: Prevents injection attacks
2. **File Type Validation**: Restricts uploads to PDF/DOCX
3. **File Size Limits**: Prevents DoS via large files
4. **CORS Configuration**: Restricts origins to `http://localhost:3000`

### 10.2 Security Gaps & Recommendations

**Current Gaps:**
- No authentication/authorization
- No rate limiting
- No input sanitization (XSS protection)
- File storage path traversal vulnerability
- No HTTPS enforcement
- Database credentials in environment variables (good practice, but needs secure management)

**Recommendations:**
1. Implement JWT-based authentication
2. Add rate limiting middleware
3. Sanitize user inputs
4. Validate file paths (prevent directory traversal)
5. Implement HTTPS in production
6. Use secrets management (AWS Secrets Manager, HashiCorp Vault)
7. Add request logging and monitoring
8. Implement CSRF protection

---

## 11. Testing Strategy

### 11.1 Backend Testing

**Framework**: Jest with ts-jest

**Test Structure:**
```
backend/src/__tests__/
└── application/
    └── validator.test.ts
```

**Test Coverage:**
- Unit tests for validation logic
- Test cases for valid/invalid inputs
- Edge case testing

**Example Test Pattern:**
```typescript
describe('validateCandidateData', () => {
  describe('Valid candidate data', () => {
    it('should not throw an error for valid candidate data', () => {
      // Arrange, Act, Assert
    });
  });
  
  describe('Invalid candidate data', () => {
    it('should throw an error for invalid email', () => {
      // Test invalid scenarios
    });
  });
});
```

### 11.2 Frontend Testing

**Framework**: Jest with React Testing Library

**Test Structure:**
```
frontend/src/__tests__/
├── App.test.tsx
├── components/
└── services/
    └── candidateService.test.ts
```

**Testing Approach:**
- Component rendering tests
- Service layer tests
- User interaction tests

---

## 12. Deployment Architecture

### 12.1 Development Environment

**Components:**
- Backend: Node.js server on port 3010
- Frontend: React dev server on port 3000
- Database: PostgreSQL via Docker Compose

**Docker Compose Services:**
```yaml
services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - ${DB_PORT}:5432
```

### 12.2 Build Process

**Backend:**
```bash
npm run build  # TypeScript compilation → dist/
npm start      # Run compiled JavaScript
```

**Frontend:**
```bash
npm run build  # Create React App build → build/
npm start      # Development server
```

### 12.3 Production Considerations

**Recommendations:**
1. **Containerization**: Dockerize backend and frontend
2. **Reverse Proxy**: Nginx for static files and API routing
3. **Database**: Managed PostgreSQL service (AWS RDS, Azure Database)
4. **File Storage**: Cloud storage (S3, Azure Blob) instead of local filesystem
5. **Environment Variables**: Secure configuration management
6. **Monitoring**: Application performance monitoring (APM)
7. **Logging**: Centralized logging (ELK stack, CloudWatch)

---

## 13. Code Quality & Standards

### 13.1 TypeScript Configuration

**Backend (`tsconfig.json`):**
- Target: ES5
- Module: CommonJS
- Strict mode: Enabled
- Output: `dist/` directory

**Frontend (`tsconfig.json`):**
- Target: ES5
- Module: ESNext
- JSX: react-jsx
- Strict mode: Enabled

### 13.2 Code Organization Rules

1. **Layer Separation**: Strict boundaries between layers
2. **Naming Conventions**:
   - Classes: PascalCase (`Candidate`)
   - Functions: camelCase (`addCandidate`)
   - Files: camelCase for services, PascalCase for models
3. **File Structure**: One class/function per file (mostly)
4. **Imports**: Organized by layer (domain → application → presentation)

### 13.3 Linting & Formatting

**Tools:**
- ESLint 9.2.0
- Prettier 3.2.5
- ESLint Prettier plugin

**Configuration:**
- Backend: Custom ESLint config
- Frontend: React App ESLint config

---

## 14. Common Patterns & Rules

### 14.1 Data Flow Pattern

```
User Input (Frontend)
    ↓
HTTP Request
    ↓
Route Handler
    ↓
Controller
    ↓
Validator (if needed)
    ↓
Service Layer
    ↓
Domain Model
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response (reverse flow)
```

### 14.2 Transaction Management

**Current Approach:**
- Prisma handles transactions implicitly
- No explicit transaction boundaries
- Related entities created sequentially

**Recommendation:**
- Use Prisma transactions for atomicity:
```typescript
await prisma.$transaction(async (tx) => {
  const candidate = await tx.candidate.create(...);
  await tx.education.createMany(...);
  // etc.
});
```

### 14.3 Dependency Injection

**Current Pattern:**
- Prisma client instantiated globally
- Injected via Express middleware (`req.prisma`)

**Alternative Consideration:**
- Constructor injection for better testability
- Dependency injection container (InversifyJS, TSyringe)

### 14.4 Configuration Management

**Pattern**: Environment variables via `dotenv`

**Configuration:**
- Database URL
- Server port
- CORS origins
- File upload settings

---

## 15. Known Limitations & Technical Debt

### 15.1 Current Limitations

1. **No Authentication**: System is open to all users
2. **No Authorization**: No role-based access control
3. **Limited Error Messages**: Generic error responses
4. **No Pagination**: Could be issue with large datasets
5. **No Search/Filter**: Basic CRUD only
6. **File Storage**: Local filesystem (not scalable)
7. **No Audit Trail**: No tracking of changes
8. **Single Database Instance**: No replication/backup strategy

### 15.2 Technical Debt

1. **Mixed TypeScript/JavaScript**: Frontend uses both
2. **Duplicate Validation**: API spec and code validation
3. **Error Handling**: Inconsistent error response formats
4. **Testing Coverage**: Limited test coverage
5. **Documentation**: API documentation not auto-generated from code
6. **Active Record Pattern**: Tight coupling to Prisma

---

## 16. Future Enhancements

### 16.1 Recommended Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Recruiter, Admin, etc.)

2. **Candidate Management**
   - Candidate search and filtering
   - Pagination for candidate lists
   - Candidate status workflow (Applied, Interviewing, Hired, Rejected)

3. **File Management**
   - Cloud storage integration (AWS S3, Azure Blob)
   - File versioning
   - File preview capabilities

4. **Reporting & Analytics**
   - Candidate pipeline metrics
   - Time-to-hire analytics
   - Source tracking

5. **Integration**
   - Email notifications
   - Calendar integration for interviews
   - Job board integrations

6. **Performance**
   - Caching layer (Redis)
   - Database query optimization
   - CDN for static assets

---

## 17. Conclusion

The LTI Talent Tracking System demonstrates a well-structured layered architecture with clear separation of concerns. The use of TypeScript, Prisma, and React provides a modern, type-safe development experience. While the current implementation covers core ATS functionality, there are opportunities for enhancement in security, scalability, and feature completeness.

**Key Strengths:**
- Clean architecture with layer separation
- Type safety with TypeScript
- Modern technology stack
- Comprehensive validation
- RESTful API design

**Areas for Improvement:**
- Security (authentication, authorization)
- Testing coverage
- Scalability considerations
- Error handling consistency
- Documentation automation

---

## Appendix A: Glossary

- **ATS**: Applicant Tracking System
- **ORM**: Object-Relational Mapping
- **DTO**: Data Transfer Object
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **CORS**: Cross-Origin Resource Sharing
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete

---

## Appendix B: References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Architecture Analysis  
**System**: LTI - Talent Tracking System



