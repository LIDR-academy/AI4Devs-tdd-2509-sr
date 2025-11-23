# Project Context

## Purpose
LTI (Sistema de Seguimiento de Talento) is a full-stack talent tracking system that allows recruiters to manage candidate information, including personal details, education history, work experience, and resume files. The system provides both a web interface and REST API endpoints for candidate management.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (strict mode enabled)
- **ORM**: Prisma 5.13.0
- **Database**: PostgreSQL (via Docker)
- **File Upload**: Multer 2.0.2
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Development**: ts-node-dev for hot reloading
- **Testing**: Jest 29.7.0, ts-jest 29.2.5

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 4.9.5
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **UI Library**: Bootstrap 5.3.3, React Bootstrap 2.10.2
- **Icons**: React Bootstrap Icons 1.11.4
- **Routing**: React Router DOM 6.23.1
- **Date Picker**: react-datepicker 6.9.0
- **Testing**: Jest, React Testing Library

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL (containerized)
- **Environment**: dotenv for environment variables

## Project Conventions

### Code Style
- **Quotes**: Single quotes (enforced by Prettier)
- **Trailing Commas**: Always (enforced by Prettier)
- **Linting**: ESLint with Prettier integration
- **TypeScript**: Strict mode enabled in both frontend and backend
- **File Naming**: 
  - Backend: camelCase for files (e.g., `candidateService.ts`)
  - Frontend: PascalCase for components (e.g., `AddCandidateForm.js`)
- **Code Formatting**: Prettier configuration in `backend/.prettierrc`

### Architecture Patterns

#### Backend Architecture (Layered Architecture)
The backend follows a layered architecture pattern with clear separation of concerns:

- **Domain Layer** (`src/domain/models/`): Contains business entities and domain models
  - Models: `Candidate.ts`, `Education.ts`, `WorkExperience.ts`, `Resume.ts`
  - Domain models encapsulate business logic and data persistence using Prisma

- **Application Layer** (`src/application/`): Contains application services and business logic
  - Services: `candidateService.ts`, `fileUploadService.ts`
  - Validators: `validator.ts`

- **Presentation Layer** (`src/presentation/controllers/`): Handles HTTP requests and responses
  - Controllers: `candidateController.ts`

- **Routes** (`src/routes/`): Defines API endpoints
  - Route files: `candidateRoutes.ts`

- **Entry Point** (`src/index.ts`): Express app setup, middleware configuration, and server initialization

#### Frontend Architecture
- **Components** (`src/components/`): React components for UI
- **Services** (`src/services/`): API communication layer
- **Public** (`public/`): Static assets
- **Build** (`build/`): Production build output

#### Database
- **ORM**: Prisma for type-safe database access
- **Migrations**: Prisma migrations in `backend/prisma/migrations/`
- **Schema**: Defined in `backend/prisma/schema.prisma`

### Testing Strategy
- **Testing Framework**: Jest with ts-jest for TypeScript support
- **Test Environment**: Node.js environment for backend tests
- **Test Configuration**: `jest.config.js` at project root
- **Test Script**: `npm test` (configured with `--passWithNoTests` flag)
- **Test Location**: Tests should be placed alongside source files or in `__tests__` directories
- **Naming Convention**: Test files should end with `.test.ts` or `.spec.ts`

### Git Workflow
- **Main Branch**: `main` - contains stable, production-ready code
- **Feature Branches**: Use descriptive names (e.g., `test-GGL`)
- **Commit Messages**: Descriptive commit messages in Spanish or English
- **Remote Repositories**:
  - `origin`: Personal fork (gustavogte/AI4Devs-tdd-2509-sr)
  - `upstream`: Original repository (LIDR-academy/AI4Devs-tdd-2509-sr)

## Domain Context

### Core Entities
1. **Candidate**: Represents a job candidate with personal information
   - Fields: firstName, lastName, email (unique), phone, address
   - Relationships: Has many Educations, WorkExperiences, and Resumes

2. **Education**: Represents a candidate's educational background
   - Fields: institution, title, startDate, endDate (optional)
   - Belongs to: Candidate

3. **WorkExperience**: Represents a candidate's work history
   - Fields: company, position, description (optional), startDate, endDate (optional)
   - Belongs to: Candidate

4. **Resume**: Represents a candidate's uploaded resume file
   - Fields: filePath, fileType, uploadDate
   - Belongs to: Candidate

### API Endpoints
- `POST /candidates` - Create a new candidate
- `POST /upload` - Upload a file (resume)
- `GET /` - Health check endpoint

### Business Rules
- Email addresses must be unique across all candidates
- File uploads are restricted to PDF and DOCX formats
- Maximum file size: 10MB
- Dates are stored as DateTime in the database

## Important Constraints

### Technical Constraints
- Backend runs on port 3010
- Frontend runs on port 3000
- Database runs on port 5432 (PostgreSQL default)
- CORS is configured to allow requests from `http://localhost:3000`
- TypeScript strict mode is enabled (no implicit any, strict null checks, etc.)

### Environment Variables
- Backend requires `.env` file in `backend/` directory with:
  - `DATABASE_URL`: PostgreSQL connection string
  - `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`: Database credentials
- Root `.env` file contains database configuration for Docker Compose

### File Upload Constraints
- Allowed file types: PDF (`application/pdf`) and DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- Maximum file size: 10MB
- Files are stored in `../uploads/` directory relative to backend

## External Dependencies

### Database
- **PostgreSQL**: Primary database, containerized via Docker
- **Connection**: Managed through Prisma ORM
- **Migrations**: Handled by Prisma Migrate

### Development Tools
- **Docker**: For containerizing PostgreSQL database
- **Docker Compose**: For orchestrating database service
- **Prisma**: Database ORM and migration tool
- **Swagger**: API documentation and testing interface

### Runtime Dependencies
- **Express**: Web framework for backend API
- **React**: UI framework for frontend
- **Prisma Client**: Type-safe database client
- **Multer**: File upload handling middleware
- **CORS**: Cross-origin resource sharing middleware
