# Registro de Prompts - Pruebas Unitarias ATS

## 1. Objetivo

Implementar una suite de pruebas unitarias siguiendo la metodología TDD (Test Driven Development) para la funcionalidad de "Inserción de Candidatos" en el sistema ATS. El objetivo principal era asegurar la correcta validación de los datos de entrada y la persistencia de la información utilizando mocks para aislar la lógica del negocio de la base de datos (Prisma ORM).

## 2. Prompt Inicial
>
> Actúa como un Ingeniero de Software Senior experto en Backend, TypeScript y metodologías TDD (Test Driven Development) con Jest.
>
> Contexto: Estoy trabajando en un sistema ATS (Applicant Tracking System) y necesito asegurar la calidad de la funcionalidad de "Inserción de Candidatos". El stack tecnológico utiliza Node.js, TypeScript y Prisma como ORM.
>
> Objetivo: Generar una suite de tests unitarios utilizando Jest.
>
> Instrucciones específicas:
>
> 1. Analiza el código existente: Revisa los controladores y servicios encargados de recibir y guardar los candidatos (busca archivos relacionados con candidates).
> 2. Crea el archivo de tests: Genera el código necesario para el archivo backend/src/tests/tests-iniciales.test.ts.
> 3. Cobertura requerida:
>      * Validación de entrada: Crea tests que verifiquen que el sistema rechaza datos incorrectos (ej. faltan campos obligatorios como email o nombre, formato de email inválido).
>      * Persistencia: Crea un test para el "Happy Path" (caso de éxito) donde se verifique que, con datos correctos, se llama al método de creación de Prisma.
> 4. Mocking: Es OBLIGATORIO mockear el cliente de Prisma (prismaClient) para aislar los tests y no escribir en la base de datos real.
> 5. Formato: Entrega el código listo para copiar y pegar, incluyendo los imports necesarios.
>
> Entregables:
>
> * El contenido completo del archivo backend/src/tests/tests-iniciales.test.ts.

## 3. Iteraciones y Refinamientos

Durante la ejecución, se realizaron las siguientes iteraciones basadas en la retroalimentación del entorno de ejecución (logs de error):

* **Refinamiento 1: Reglas de Hoisting de Jest**
  * **Problema:** Error `The module factory of jest.mock() is not allowed to reference any out-of-scope variables`.
  * **Acción:** Se renombraron las variables de mock con el prefijo `mock` (ej. `mockPrisma`) para cumplir con las restricciones de seguridad de Jest.

* **Refinamiento 2: Configuración de TypeScript en Jest**
  * **Problema:** Error `SyntaxError: Cannot use import statement outside a module` debido a que Jest no reconocía la sintaxis de TypeScript por defecto.
  * **Acción:** Se creó el archivo `jest.config.js` configurando el preset `ts-jest` y el entorno `node`.

* **Refinamiento 3: Acceso a Instancias de Mocks**
  * **Problema:** El mock de Prisma no capturaba correctamente las llamadas al ser instanciado dentro de los modelos de dominio.
  * **Acción:** Se refactorizó la factoría del mock para exponer una propiedad `__mockInstance` que permite acceder al mismo objeto de mock tanto en los tests como en el código fuente, asegurando que los espías funcionen correctamente.

## 4. Lecciones Aprendidas

El uso de la IA aceleró significativamente la creación inicial de las pruebas, especialmente en la generación de datos de prueba y casos de excepcion para las validaciones. Sin embargo, el flujo de TDD evidenció que la configuración técnica de los mocks (especialmente con ORMs como Prisma que utilizan instanciación modular) requiere un conocimiento profundo de las herramientas de testing. La capacidad de la IA para interpretar errores de consola y proponer soluciones de configuración permitió resolver cuellos de botella técnicos en minutos, permitiendome centrarme en la lógica de negocio y la calidad de los datos.
