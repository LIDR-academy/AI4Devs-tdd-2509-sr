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

---

## Prompt 2: Generación de Tests Unitarios para Inserción de Candidatos

Actúa como un Senior Software Engineer experto en testing y TDD. Tu tarea es crear una suite completa de tests unitarios para la funcionalidad de **inserción de candidatos en base de datos**.

### Contexto del Proyecto
- **Stack**: Node.js + TypeScript + Prisma + PostgreSQL
- **Framework de Testing**: Vitest
- **Arquitectura**: Clean Architecture (separación entre domain e infrastructure)
- **Ubicación de tests**: `src/__tests__/`

### Requisitos Específicos

#### 1. Estructura del Test
- Crear una **suite completa en un único archivo** de test
- Usar nomenclatura descriptiva siguiendo el patrón: `<funcionalidad>.test.ts`
- Organizar con `describe` y `it/test` de forma clara y jerárquica

#### 2. Cobertura de Casos (Nivel Básico)
Cubrir los siguientes escenarios:

**Happy Path:**
- Inserción exitosa de un candidato con datos válidos y completos
- Verificar que se retorna el candidato creado con su ID generado

**Casos de Error (Datos Inválidos/Incompletos):**
- Datos faltantes en campos obligatorios (firstName, lastName, email)
- Email con formato inválido
- Teléfono con formato inválido (si aplica validación)
- Campos que excedan longitud máxima permitida

#### 3. Estrategia de Mocking
- **Mockear todas las llamadas a Prisma** usando `vitest-mock-extended`
- Utilizar el mock centralizado en `src/infrastructure/database/__mocks__/prisma.ts`
- NO hacer llamadas reales a la base de datos

#### 4. Fixtures y Datos de Prueba
- Crear **fixtures reutilizables** con datos de candidatos válidos e inválidos
- Definir constantes para datos de prueba al inicio del archivo
- Asegurar que los fixtures sean realistas y representativos

#### 5. Mejores Prácticas a Implementar
- **AAA Pattern** (Arrange, Act, Assert) en cada test
- **Isolation**: Cada test debe ser independiente (usar `beforeEach`/`afterEach`)
- **Descriptive Names**: Nombres de tests que describan el comportamiento esperado
- **Single Responsibility**: Cada test valida un único comportamiento
- **Clear Assertions**: Usar matchers específicos de Vitest (`toEqual`, `toThrow`, `toHaveBeenCalledWith`)
- **Type Safety**: Aprovechar TypeScript para type checking en tests

#### 6. Reglas de Negocio a Validar
- Validación de formato de email
- Campos obligatorios vs opcionales
- Longitudes máximas de campos
- Tipos de datos correctos (según el schema de Prisma)

#### 7. Estructura Esperada del Test

```typescript
// Imports necesarios
// Fixtures y constantes
// describe principal
//   beforeEach/afterEach setup
//   describe 'Happy Path'
//     test casos exitosos
//   describe 'Validaciones de Datos'
//     test casos de error
```

#### 8. Consideraciones Adicionales
- Incluir comentarios explicativos donde sea necesario
- Limpiar mocks después de cada test
- Verificar que los métodos de Prisma fueron llamados con los parámetros correctos
- Manejar promesas y async/await correctamente

### Output Esperado
Genera el código completo del archivo de test incluyendo:
1. Todos los imports necesarios
2. Fixtures de datos de prueba
3. Suite de tests completa con casos happy path y validaciones
4. Comentarios que expliquen la estrategia de testing

### Archivos de Referencia
Basarte en la estructura de:
- Modelos de dominio en `src/domain/models/`
- Configuración de Prisma y mocks en `src/infrastructure/database/`
- Schema de Prisma para entender las validaciones del modelo
