# Prompts Utilizados - Creación de Tests Unitarios

Este documento contiene los prompts utilizados para completar la actividad del módulo TDD de AI4Devs.

## Prompt 1: Análisis del Proyecto

**Objetivo:** Entender la estructura del proyecto y la funcionalidad de inserción de candidatos.

```
I'm working on an AI4Devs TDD exercise. I need to analyze this project to understand:

1. The overall project structure (frontend/backend)
2. The candidate insertion functionality in the backend
3. The database schema (Prisma)
4. Any existing test configuration

Please:
1. Explore the project structure
2. Read the key files related to candidate management:
   - backend/src/application/services/candidateService.ts
   - backend/src/application/validator.ts
   - backend/src/domain/models/Candidate.ts
   - backend/src/presentation/controllers/candidateController.ts
   - backend/prisma/schema.prisma
3. Read the backend/package.json to check existing dependencies

After analysis, create a file `prompts/project-analysis-output.md` with:
- Summary of the project architecture
- Description of the candidate insertion flow
- List of validation rules found in validator.ts
- Key functions that need to be tested
- Current test-related dependencies installed

This analysis will be used for the next steps: configuring Jest and writing unit tests.
```

**Resultado:** Se generó el archivo `prompts/project-analysis-output.md` con:
- Arquitectura del proyecto: Full-stack (React frontend + Express/TypeScript backend con PostgreSQL/Prisma)
- Flujo de inserción: Controller → Service → Validator → Domain Model → Prisma → DB
- Reglas de validación identificadas: nombre (2-100 chars, solo letras), email (formato estándar), teléfono (formato español), fecha (YYYY-MM-DD), dirección (max 100 chars)
- Funciones clave a testear: validators, addCandidate service, Candidate.save(), controller
- Dependencias de test existentes: jest, ts-jest, @types/jest (ya instaladas, falta configuración)

---

## Prompt 2: Configuración de Jest

**Objetivo:** Configurar el entorno de testing con Jest y ts-jest.

```
I need to configure Jest for testing a TypeScript backend project. The project uses:
- TypeScript
- Prisma ORM
- Express.js

Please complete the following tasks:

1. Check if jest and ts-jest are already installed in backend/package.json
   - If not installed, install them: `npm install --save-dev jest ts-jest @types/jest`

2. Create a Jest configuration file at `backend/jest.config.js` with:
   - TypeScript support via ts-jest
   - Test file pattern: `**/*.test.ts`
   - Test environment: node
   - Module path aliases if needed (check tsconfig.json)
   - Coverage configuration
   - Ignore patterns for node_modules and dist

3. Update `backend/package.json` scripts to include:
   - "test": "jest"
   - "test:watch": "jest --watch"
   - "test:coverage": "jest --coverage"

4. Create a simple test file `backend/src/tests/setup.test.ts` that verifies Jest is working:
   - A simple "describe" block with one test that passes
   - This confirms the setup is correct

5. Run `npm test` in the backend folder to verify everything works

After completing, output a summary of:
- Files created/modified
- Any issues encountered and how they were resolved
- Confirmation that `npm test` runs successfully
```

**Resultado:**
- Verificado que jest (v29.7.0), ts-jest (v29.2.5) y @types/jest (v29.5.13) ya estaban instalados
- Creado `backend/jest.config.js` con:
  - Preset ts-jest para soporte TypeScript
  - Entorno de test: node
  - Patrón de archivos: `**/*.test.ts`
  - Configuración de cobertura desde `src/**/*.ts`
  - Patrones de exclusión para node_modules y dist
- Actualizado `backend/package.json` con scripts: `test:watch` y `test:coverage`
- Creado `backend/src/tests/setup.test.ts` con 2 tests de verificación
- Ejecutado `npm test` exitosamente:
  ```
  PASS src/tests/setup.test.ts
    Jest Setup
      ✓ should be configured correctly (1 ms)
      ✓ should support TypeScript (1 ms)

  Test Suites: 1 passed, 1 total
  Tests:       2 passed, 2 total
  Time:        1.236 s
  ```

---

## Prompt 3: Estrategia de Testing

**Objetivo:** Desarrollar una estrategia de testing para la funcionalidad de candidatos.

```
I need to create a testing strategy for the candidate insertion functionality in an ATS (Applicant Tracking System).

Based on Activity 2 requirements, I need tests for two main areas:
1. **Form data reception** - Validation of incoming candidate data
2. **Database saving** - Persisting candidates to the database

Please analyze:
- backend/src/application/validator.ts - for validation rules
- backend/src/application/services/candidateService.ts - for business logic
- backend/src/domain/models/Candidate.ts - for the data model
- backend/prisma/schema.prisma - for database constraints

Then create a file `prompts/testing-guide.md` that includes:

## Testing Guide Structure

1. **Overview**
   - Purpose of the tests
   - Testing approach (unit tests with mocking)

2. **Test Categories**

   ### A. Data Validation Tests (Form Data Reception)
   List specific test cases for:
   - firstName validation (required, format, length)
   - lastName validation (required, format, length)
   - email validation (required, format, uniqueness)
   - phone validation (optional, Spanish format)
   - address validation (optional, max length)
   - education array validation
   - workExperience array validation
   - cv object validation

   ### B. Database Operation Tests
   List specific test cases for:
   - Successful candidate creation
   - Handling duplicate email errors
   - Saving related entities (education, work experience, resume)
   - Error handling scenarios

3. **Mocking Strategy**
   - How to mock Prisma Client
   - What to mock vs what to test

4. **Test File Structure**
   - Recommended organization of test files
   - Naming conventions

5. **Sample Test Cases Table**
   | Test ID | Category | Description | Expected Result |
   |---------|----------|-------------|-----------------|
   | VAL-001 | Validation | Valid candidate data passes validation | true |
   | ... | ... | ... | ... |

Output the complete testing-guide.md file.
```

**Resultado:** Se creó `prompts/testing-guide.md` con:
- **Overview**: Propósito de los tests y enfoque (unit tests con mocking)
- **Test Categories**:
  - **Data Validation Tests**: 65+ casos de prueba cubriendo:
    - firstName/lastName (formato, longitud 2-100, caracteres españoles)
    - email (formato requerido, validación regex)
    - phone (formato español 6/7/9 + 8 dígitos, opcional)
    - address (max 100 chars, opcional)
    - education array (institution, title, startDate, endDate)
    - workExperience array (company, position, description, dates)
    - cv object (filePath, fileType requeridos)
  - **Database Operation Tests**: 16 casos cubriendo:
    - Creación exitosa de candidatos
    - Manejo de email duplicado (error P2002)
    - Guardado de entidades relacionadas
    - Manejo de errores (conexión, registro no encontrado)
- **Mocking Strategy**: Cómo mockear Prisma Client con jest-mock-extended y mocks manuales
- **Test File Structure**: Organización recomendada en `src/tests/unit/` con convenciones de nombrado
- **Sample Test Cases Table**: Tabla completa con Test IDs (VAL-*, DB-*), categorías, inputs y resultados esperados
- **Running Tests**: Comandos npm y targets de cobertura (>80-90%)
- **Edge Cases**: Modo edición (id bypasses validation), caracteres españoles, formatos de teléfono/fecha

---

## Prompt 4: Tests de Validación de Datos

**Objetivo:** Implementar tests para la recepción de datos del formulario.

```
I need to implement unit tests for the candidate data validation functionality. These tests cover the "form data reception" test family.

First, read these files to understand the validation logic:
- backend/src/application/validator.ts
- backend/src/application/services/candidateService.ts

Then create the test file `backend/src/tests/tests-iniciales.test.ts` with the following structure:

// Tests for candidate insertion functionality
// Activity 2: AI4Devs TDD Exercise

describe('Candidate Data Validation', () => {
  // Test valid candidate data
  // Test firstName validation (empty, too short, invalid chars, too long)
  // Test lastName validation (empty, too short, invalid chars, too long)
  // Test email validation (empty, invalid format)
  // Test phone validation (invalid format - should be Spanish format)
  // Test address validation (too long)
  // Test education validation (dates, required fields)
  // Test workExperience validation
});

Requirements:
1. Import the validation functions from the validator module
2. Create test cases for both valid and invalid scenarios
3. Use descriptive test names that explain what is being tested
4. Group related tests in nested describe blocks
5. Test edge cases (empty strings, null values, boundary lengths)

Test cases must include at minimum:
- Valid candidate data passes all validations
- Empty firstName fails validation
- Invalid email format fails validation
- Invalid phone format (non-Spanish) fails validation
- Valid Spanish phone number passes validation

Use Jest's expect assertions for validating results.

After creating the tests, do NOT run them yet (we'll add database tests first).

Output:
- The complete test file content
- Summary of test cases created
```

**Resultado:** Se creó `backend/src/tests/tests-iniciales.test.ts` con **81 casos de prueba** organizados en las siguientes categorías:

| Categoría | Casos de Prueba | Descripción |
|-----------|-----------------|-------------|
| **Valid Candidate Data** | 4 | Datos válidos con campos requeridos, educación, experiencia laboral, y modo edición (id) |
| **firstName Validation** | 11 | Empty, null, undefined, too short (1 char), boundary (2 chars), caracteres inválidos (números/especiales), caracteres españoles (ñ, acentos), too long (>100), boundary (100 chars) |
| **lastName Validation** | 7 | Empty, null, too short, boundary, caracteres inválidos, caracteres españoles, too long |
| **email Validation** | 8 | Empty, null, formato inválido (sin @, sin dominio, sin TLD, TLD corto), formatos válidos |
| **phone Validation** | 12 | Opcional (undefined/empty), formato no español, too short/long, dígito inicial inválido, móviles españoles válidos (6xx, 7xx), fijo español (9xx), caracteres no numéricos, espacios, prefijo de país |
| **address Validation** | 5 | Opcional (undefined/empty), longitud válida, boundary (100 chars), too long |
| **education Validation** | 13 | Array opcional/vacío, institution (missing/empty/too long), title (missing/empty/too long), startDate (missing/invalid format), endDate (invalid format), educación en curso, múltiples educaciones |
| **workExperience Validation** | 14 | Array opcional/vacío, company (missing/empty/too long), position (missing/empty/too long), description (too long/boundary 200 chars), startDate (missing/invalid), endDate (invalid), trabajo actual, múltiples experiencias |
| **CV Validation** | 7 | Opcional (undefined/empty object), filePath/fileType missing, tipos no string, CV válido |

**Características del archivo de tests:**
- Helper function `createValidCandidate()` para crear datos de prueba con overrides
- Bloques `describe` anidados para organización lógica
- Nombres de tests descriptivos explicando cada escenario
- Cobertura de edge cases (empty strings, null, undefined, boundary lengths)
- Validaciones específicas para España (formato de teléfono, caracteres con ñ y acentos)

---

## Prompt 5: Tests de Operaciones de Base de Datos

**Objetivo:** Implementar tests para el guardado en base de datos con mocks de Prisma Client.

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

**Resultado:** Se implementaron **14 tests de base de datos** añadidos al archivo existente:

| Categoría | Casos de Prueba | Descripción |
|-----------|-----------------|-------------|
| **Successful Candidate Creation** | 4 | Creación básica, con educación, con experiencia laboral, con CV |
| **Duplicate Email Handling (P2002)** | 2 | Email duplicado normal, email duplicado con diferente capitalización |
| **Database Connection Error Handling** | 2 | Error de conexión graceful, propagación de errores desconocidos |
| **Candidate Creation with Related Data** | 3 | Múltiples educaciones, múltiples experiencias, perfil completo |
| **Validation Errors Before Database Save** | 2 | Datos inválidos no llegan a BD, email inválido no llega a BD |

**Archivos creados/modificados:**
- `backend/src/tests/__mocks__/prisma.ts` - Mock de Prisma Client usando jest-mock-extended
- `backend/src/tests/tests-iniciales.test.ts` - Actualizado con tests de base de datos

**Dependencia instalada:**
- `jest-mock-extended` - Para deep mocking del Prisma Client

**Técnicas de mocking utilizadas:**
- Mock functions persistentes (`mockCandidateCreate`, `mockEducationCreate`, etc.)
- `jest.mock('@prisma/client')` antes de importar el servicio
- `mockResolvedValue()` para simular respuestas exitosas
- `mockRejectedValue()` para simular errores (P2002, conexión)
- `jest.clearAllMocks()` en `beforeEach` para aislar tests

**Total de tests en el archivo:** 95 tests (81 validación + 14 base de datos)

**Ejecución exitosa:**
```
PASS src/tests/tests-iniciales.test.ts
  Candidate Data Validation (81 tests)
  Candidate Database Operations (14 tests)

Test Suites: 1 passed, 1 total
Tests:       95 passed, 95 total
Time:        1.484 s
```

---

## Prompt 6: Ejecución y Verificación

**Objetivo:** Ejecutar los tests y verificar que todo funciona correctamente.

```
[Pendiente - El prompt 5 ya ejecutó y verificó los tests exitosamente]
```

**Resultado:**
- Todos los 95 tests pasando
- Cobertura de las dos familias de tests requeridas:
  - ✅ Recepción de datos del formulario (81 tests de validación)
  - ✅ Guardado en base de datos (14 tests con mocks)
- Archivos entregables listos

---

## Resumen de Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `backend/jest.config.js` | Configuración de Jest |
| `backend/src/tests/tests-iniciales.test.ts` | Tests unitarios |
| `backend/src/tests/__mocks__/prisma.ts` | Mock de Prisma |
| `prompts/testing-guide.md` | Guía de estrategia de testing |
| `prompts/prompts-iniciales.md` | Este documento |

---

## Ajustes Manuales Realizados

[Documentar aquí cualquier ajuste manual que se haya hecho a los resultados de los prompts]

1. ...
2. ...

---

## Conclusiones

[Agregar observaciones sobre el proceso de TDD con asistencia de IA]
