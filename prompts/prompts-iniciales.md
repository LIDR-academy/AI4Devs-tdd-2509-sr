## Prompt 1:

En el backend debemos realizar test unitarios, pero aun no tenemos configurado vitest en el proyecto correctamente. Puedes guiarte de aqui para la implementación: https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o

## Resultado 1:

Plan: Configure Vitest for Backend Unit Testing with Prisma

1. Update Dependencies
   Remove Jest and ts-jest from devDependencies
   Install Vitest and vitest-mock-extended
   Update test script in package.json to use Vitest
2. Create Vitest Configuration
   Create vitest.config.ts at backend root
   Configure TypeScript support, test patterns, and globals
3. Refactor Prisma Client Setup
   Create src/infrastructure/database/prisma.ts with singleton PrismaClient
   Create mock directory: src/infrastructure/database/**mocks**/prisma.ts
   Implement deep mock using vitest-mock-extended
4. Update Existing Code to Use Singleton
   Update all domain models (Candidate, Education, WorkExperience, Resume) to import from centralized prisma.ts
   Update candidateService.ts to use singleton
5. Create Minimal Verification Test
   Create a simple test file (e.g., src/**tests**/setup.test.ts) to verify:
   Vitest is running correctly
   TypeScript compilation works
   Prisma mock can be imported and used
   This is just to validate the configuration, NOT full test cases
6. Add Test Scripts
   Add scripts for running tests, coverage, and watch mode
   After this setup is complete, you can create specific test cases for your application logic.
