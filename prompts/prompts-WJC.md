# Prompts Iniciales - Suite de Tests Unitarios

Este documento contiene la documentación de los prompts utilizados para crear la suite de tests unitarios para la funcionalidad de inserción de candidatos.

## Prompt Principal

```
Atuar como un experto en desarrollo de software y creación de tests unitarios.

Tu misión será crear una suite de tests unitarios en Jest para la funcionalidad de insertar candidatos en base de datos. 

hay 2 familias principales de tests, recepción de los datos del formulario, y guardado en la base de datos. Quero ver tests que cubran ambos procesos con al menos un test.

Aplicar las buenas practicas para testes unitarios.

No es necesario modificar la base de datos, pero si identifica un caso de testes que interactua con la base, deberiamos hacer un mock.

Puedes encontrar más información para este caso concreto de mockear la base en la documentación de prisma (https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client)

Los tests en un fichero tests-WJC.test.ts en la carpeta backend/src/tests 

Un fichero prompts-WJC.md en la carpeta prompts.

En caso de dudas me haga las preguntas necesarias
```

## Contexto del Proyecto

El proyecto es una aplicación full-stack con:
- **Backend**: Express + TypeScript + Prisma ORM
- **Frontend**: React + TypeScript
- **Base de Datos**: PostgreSQL

## Funcionalidad Testada

### Inserción de Candidatos

La funcionalidad de inserción de candidatos involucra dos procesos principales:

1. **Recepción y Validación de los Datos del Formulario**
   - Validación de campos obligatorios (firstName, lastName, email)
   - Validación de campos opcionales (phone, address)
   - Validación de datos relacionados (educations, workExperiences, CV)
   - Validación de formatos (email, phone, dates)

2. **Guardado en la Base de Datos**
   - Creación del candidato en la base de datos
   - Creación de registros relacionados (educations, workExperiences, resumes)
   - Tratamiento de errores (email duplicado, errores de conexión)

## Estructura de los Tests Implementados

### Familia 1: Validación de Datos del Formulario

#### Tests de Validación Exitosa
- Validación con todos los campos válidos
- Validación con campos opcionales ausentes
- Validación con educations
- Validación con workExperiences
- Validación con CV
- Modo de edición (cuando id es proporcionado)

#### Tests de Validación de Campos Individuales
- **firstName**: vacío, muy corto, muy largo, caracteres inválidos
- **lastName**: vacío, muy corto, muy largo, caracteres inválidos
- **email**: formato inválido, vacío, dominio ausente, TLD ausente
- **phone**: formato inválido, no comienza con 6, 7 o 9, validación de formatos válidos
- **address**: muy largo, validación de longitud válida
- **education**: institución inválida, título inválido, fecha inválida
- **workExperience**: empresa inválida, posición inválida, descripción muy larga, fecha inválida
- **CV**: no es objeto, filePath ausente, fileType ausente, tipos inválidos

### Familia 2: Guardado en la Base de Datos

#### Setup de Mock del Prisma
- Mock del `PrismaClient` siguiendo la documentación oficial de Prisma
- Mock de los métodos `create` para candidate, education, workExperience y resume
- Mock de los modelos que utilizan PrismaClient internamente

#### Tests de Guardado Exitoso
- Guardado con datos mínimos
- Guardado con educations
- Guardado con workExperiences
- Guardado con CV
- Guardado con todos los datos relacionados

#### Tests de Errores
- Error cuando email ya existe (código P2002)
- Error cuando validación falla antes de guardar
- Error cuando conexión con base de datos falla
- Propagación de otros errores de base de datos

## Buenas Prácticas Aplicadas

### 1. Aislamiento de Tests
- Cada test es independiente
- Los mocks se resetean antes de cada test (`beforeEach`)
- Los mocks se limpian después de cada test (`afterEach`)

### 2. Patrón AAA (Arrange, Act, Assert)
- **Arrange**: Preparación de los datos y mocks
- **Act**: Ejecución de la función a testar
- **Assert**: Verificación de los resultados

### 3. Nombres Descriptivos
- Nombres de tests claros y descriptivos
- Uso de `describe` para agrupar tests relacionados
- Indicación clara del comportamiento esperado

### 4. Cobertura Completa
- Tests de casos de éxito
- Tests de casos de error
- Tests de casos límite (boundary conditions)
- Tests de validación de formatos

### 5. Mocks Apropiados
- Mock del Prisma Client para evitar interacciones reales con la base de datos
- Mock de los modelos que dependen del Prisma
- Configuración de retornos esperados en los mocks

### 6. Datos de Test Reutilizables
- Función helper `createValidCandidateData()` para crear datos válidos
- Objetos de test reutilizables

### 7. Organización Clara
- Agrupamiento por funcionalidad usando `describe`
- Separación clara entre las dos familias de tests
- Comentarios explicativos donde sea necesario

## Referencias Utilizadas

- [Documentación de Prisma - Testing](https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Estructura de Archivos Creados

```
backend/src/tests/
  └── tests-WJC.test.ts

prompts/
  └── prompts-WJC.md
```

## Ejecución de los Tests

Para ejecutar los tests:

```bash
cd backend
npm test
```

Para ejecutar con coverage:

```bash
cd backend
npm test -- --coverage
```

Para ejecutar en modo watch:

```bash
cd backend
npm test -- --watch
```

## Notas de Implementación

### Mock del Prisma Client

El mock del Prisma Client fue implementado siguiendo el enfoque recomendado por la documentación de Prisma. Como los modelos (`Candidate`, `Education`, `WorkExperience`, `Resume`) instancian el `PrismaClient` internamente, fue necesario mockear tanto el módulo `@prisma/client` como los propios modelos.

### Estructura de los Mocks

Los mocks fueron configurados para:
- Retornar valores simulados cuando las operaciones son exitosas
- Lanzar errores simulados para testar el tratamiento de errores
- Permitir verificación de llamadas y parámetros usando `toHaveBeenCalled` y `toHaveBeenCalledWith`

### Validaciones Testadas

Las validaciones testadas cubren:
- Reglas de negocio (longitud mínima/máxima)
- Formatos (regex para email, phone, dates)
- Tipos de datos (strings, objetos, arrays)
- Campos obligatorios vs opcionales

### Corrección de Caminos de Mocks (Feedback de Review)

Durante el review del código, se identificó un problema crítico con los caminos de los mocks del Jest:

**Problema Identificado:**
- El código de la aplicación (`candidateService.ts`) importa los modelos usando: `'../../domain/models/...'`
- Los mocks en el archivo de tests estaban usando: `'../domain/models/...'`
- Jest requiere que los caminos de los mocks correspondan **exactamente** a los caminos usados en los imports del código que está siendo testado

**Solución Implementada:**

1. **Actualización de caminos en los mocks:**
   - Cambiados todos los `jest.mock('../domain/models/...')` a `jest.mock('../../domain/models/...')`
   - Actualizados los `jest.requireActual()` dentro de cada mock para usar el mismo camino

2. **Configuración de moduleNameMapper en jest.config.js:**
   ```javascript
   moduleNameMapper: {
     '^../../domain/models/(.*)$': '<rootDir>/src/domain/models/$1',
   },
   ```
   Esto permite que Jest resuelva correctamente los módulos cuando los caminos de los mocks corresponden a los caminos usados por el código de la aplicación, no a los caminos relativos del archivo de test.

**Lección Aprendida:**
Es fundamental que los caminos usados en `jest.mock()` correspondan exactamente a los caminos de importación usados por el código que está siendo testado, independientemente de la ubicación del archivo de test. Esto garantiza que Jest pueda interceptar y aplicar los mocks correctamente.
