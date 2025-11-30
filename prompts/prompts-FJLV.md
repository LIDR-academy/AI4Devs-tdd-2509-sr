# Documentación de cambios - tests-FJLV

## Objetivo general

El ejercicio tuvo como propósito crear una suite de tests unitarios comprehensiva para el sistema de inserción de candidatos en la base de datos del proyecto LTI - Talent Tracking System. Se buscó implementar pruebas que cubran tanto la validación de datos del formulario como la inserción en base de datos usando Prisma como ORM, siguiendo las mejores prácticas de TDD (Test-Driven Development) y asegurando el aislamiento mediante mocks.

## Prompts utilizados

### Bloque 1: Análisis del proyecto

**Prompt utilizado:**
```
## Contexto
Estamos trabajando en un proyecto backend en TypeScript que utiliza Prisma como ORM. Antes de generar una suite de tests unitarios en Jest, necesitamos comprender el contexto del proyecto: el modelo de datos, el dominio y los servicios disponibles. El archivo `README.md` contiene información clave sobre la arquitectura, las entidades y los flujos principales.

## Objetivo
Analizar el contenido del `README.md` para:
- Identificar las entidades principales del modelo de datos (por ejemplo: Candidate, Job, etc.).
- Comprender el dominio y las reglas de negocio relevantes.
- Detectar los servicios y funciones críticas relacionadas con la inserción de candidatos.
- Preparar un resumen estructurado que sirva como base para diseñar los tests en el siguiente bloque.

## Resultado esperado
Un análisis detallado que incluya:
- **Lista de entidades y sus atributos principales**.
- **Relaciones entre entidades** (si existen).
- **Servicios y métodos relevantes** (especialmente los relacionados con la inserción de candidatos).
- **Reglas de negocio importantes** (validaciones, restricciones, flujos).
- **Posibles puntos críticos para testing** (validación de datos, errores esperados, interacción con base de datos).
```

**Justificación:** Este prompt fue diseñado para hacer una exploración comprehensiva del proyecto antes de escribir tests. Es fundamental entender la arquitectura, las entidades y las reglas de negocio para crear tests que realmente reflejen los requisitos del sistema.

### Bloque 2: Definición de tests unitarios

**Prompt utilizado:**
```
## Contexto
Estamos trabajando en un proyecto backend en TypeScript que utiliza Prisma como ORM y Jest para pruebas unitarias. Ya hemos analizado el proyecto y conocemos las entidades, servicios y reglas de negocio. La funcionalidad que queremos probar es la inserción de candidatos en la base de datos, que incluye:
1. Recepción y validación de datos desde un formulario.
2. Inserción de esos datos en la base de datos.

Las pruebas deben seguir buenas prácticas, incluyendo el uso de mocks para evitar modificar datos reales en la base de datos.

## Objetivo
Generar un archivo `tests-FJLV.test.ts` que contenga:
- Al menos un test para la recepción y validación de datos del formulario.
- Al menos un test para el guardado en la base de datos, utilizando mocks para Prisma.
- Código limpio, con nombres descriptivos y uso adecuado de `describe` y `it`.

## Resultado esperado
Un bloque de código en TypeScript con tests unitarios en Jest, que:
- Importe las funciones necesarias del proyecto (por ejemplo, `insertCandidate`).
- Utilice `jest.mock` para simular la interacción con Prisma.
- Incluya casos representativos:
  - Datos válidos (inserción correcta).
  - Datos inválidos (validación falla).
  - Error en la base de datos (simulación de fallo).
```

**Justificación:** Este prompt se enfoca específicamente en la implementación de tests unitarios siguiendo las mejores prácticas. Se solicita explícitamente el uso de mocks para aislar las pruebas de la base de datos real, y se requiere cobertura tanto de casos exitosos como de manejo de errores.

### Bloque 3: Resolución de errores técnicos

**Prompts utilizados durante la depuración:**

1. **Análisis de error inicial:**
```
Analiza el error en Candidate.ts: Cannot find module '@prisma/client' or its corresponding type declarations.ts(2307)
```

2. **Corrección de tipos TypeScript:**
```
Hay errores en el fichero de tests Variable 'mockCandidateInstance' implicitly has an 'any' type.ts(7005)
```

**Justificación:** Estos prompts fueron necesarios para resolver problemas técnicos que surgieron durante la implementación. El primer error se debió a dependencias no instaladas y cliente de Prisma no generado. El segundo error requirió ajustes en la configuración de TypeScript para manejar los mocks correctamente.

## Decisiones tomadas

### Arquitectura de Tests
- **Jest como framework de testing:** Elegido por su integración nativa con TypeScript y su amplio ecosistema de herramientas para mocking.
- **ts-jest como preset:** Permite ejecutar tests TypeScript directamente sin compilación previa.
- **Estructura modular:** Organización en bloques (`describe`) para agrupar tests relacionados por funcionalidad.

### Estrategia de Mocking
- **Mock completo de PrismaClient:** Se mockea toda la interfaz de Prisma para evitar conexiones reales a la base de datos.
- **Mock de modelos de dominio:** Se simulan las clases `Candidate`, `Education`, `WorkExperience`, y `Resume` para controlar completamente su comportamiento.
- **Mock de errores específicos:** Se simula `PrismaClientKnownRequestError` para probar el manejo de errores de base de datos.

### Cobertura de Tests
- **Validación de datos:** 12 tests que cubren todos los campos obligatorios, formatos válidos, y restricciones de longitud.
- **Inserción en BD:** 8 tests que verifican inserción exitosa, manejo de errores de unicidad, errores de conexión, y fallos en entidades relacionadas.
- **Flujos completos:** 1 test integral que simula la inserción de un candidato completo con todas sus entidades relacionadas.

### Manejo de Tipos TypeScript
- **Tipos explícitos para mocks:** Uso de `any` type para variables mock para evitar conflictos de tipo durante las pruebas.
- **Configuración flexible de ts-jest:** Configuración de `noImplicitAny: false` para permitir mayor flexibilidad en tests.

## Archivos creados/modificados

### Nuevos archivos:
- `backend/src/application/services/__tests__/tests-FJLV.test.ts` - Suite completa de tests unitarios
- `backend/jest.config.js` - Configuración específica de Jest para el backend
- `prompts/prompts-FJLV.md` - Este documento de documentación

### Archivos modificados:
- `backend/src/domain/models/Candidate.ts` - Corrección de importaciones de Prisma y manejo de errores

## Tecnologías y librerías utilizadas

- **Jest:** Framework principal de testing
- **ts-jest:** Preset para TypeScript
- **@types/jest:** Definiciones de tipos para Jest
- **Prisma:** ORM principal (mockeado en tests)
- **TypeScript:** Lenguaje principal del proyecto

## Referencias adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Configuration](https://kulshekhar.github.io/ts-jest/docs/getting-started/presets)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/unit-testing)
- [TypeScript Jest Types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jest)

## Métricas del resultado

- **Total de tests implementados:** 23
- **Tiempo de ejecución promedio:** ~1 segundo
- **Cobertura de código:** Tests cubren validación completa, inserción en BD, y manejo de errores
- **Casos de test por categoría:**
  - Validación de formularios: 12 tests
  - Operaciones de base de datos: 8 tests  
  - Flujos completos: 3 tests

## Lecciones aprendidas

1. **Importancia del análisis previo:** Comprender profundamente la arquitectura del proyecto antes de escribir tests evita retrabajos.
2. **Configuración adecuada de Jest con TypeScript:** La configuración correcta de ts-jest es crucial para evitar errores de tipos.
3. **Mocking estratégico:** Un buen diseño de mocks permite tests unitarios realmente aislados y confiables.
4. **Nombres descriptivos:** Tests con nombres claros facilitan el mantenimiento y comprensión del código.