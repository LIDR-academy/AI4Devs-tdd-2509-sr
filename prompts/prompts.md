# Prompts utilizados

Aunque el ejercicio habla de TDD, hasta donde yo sé, TDD motiva la creación de tests **antes** de tener la implementación. Este ejercicio ya propone la implementación y trata que creemos los tests.

Por ello, enfoqué el ejercicio en realizar los 3 tipos de tests según la pirámide de test:

- Aceptación o caja negra: se centran en llamadas a la api con infraestructura real (en este caso, usando docker). Debido a que estos tests son lentos, se limitan al happy path y a un corner case para validar la gestión de errores.
- Integración: en este ejercicio, los ignoro porque NO existe una separación que permita testear el acceso a base de datos (mediante repositorios) en sí.
- Unitarios: se centran en falsear la infraestructura (con mocks normalmente) y testear el happy path y todos los posíbles corner cases, incluyendo los casos límites.

## Prompt generación de tests unitarios

Empiezo por los tests unitarios, así que doy el contexto de la capa aplicación y el dominio, además del siguiente prompt:

```markdwon

## *Rol*

Eres un agente especializado en análisis de código y generación de tests unitarios. Trabajarás con Node.js + TypeScript y Prisma ORM.

Tu tarea es generar una suite de tests en Jest para la funcionalidad de inserción de candidatos.

---

## *Archivos del proyecto que debes cargar y analizar*

Cárgalos desde el sistema de archivos local:

- `file:///mnt/data/candidateService.ts`
- `file:///mnt/data/fileUploadService.ts`
- `file:///mnt/data/validator.ts`

---

## *Objetivo*

Generar el archivo:

`tests/tests-JGG.test.ts`

con tests unitarios 100% basados en:

- La lógica real del servicio
- Las validaciones existentes en el código
- Los edge cases derivados del comportamiento encontrado
- El uso real de Prisma en el proceso de inserción

---

## *Instrucciones de trabajo*

1. **Lee y analiza el código fuente** de los archivos cargados.
   Identifica:
   - Validaciones aplicadas (campos requeridos, tipos, límites, duplicados…)
   - Flujo funcional completo de inserción
   - Excepciones y errores que pueda lanzar
   - Métodos de Prisma utilizados: `.create`, `.findUnique`, etc.

2. **Deriva todos los casos de prueba necesarios**, incluyendo:
   - Caso feliz → inserción exitosa
   - Errores de validación (por cada regla encontrada)
   - Intento de insertar duplicados
   - Error interno del ORM o capa DB
   - Casos límite derivados de tipos, longitudes, rangos
   - Verificación de que Prisma recibe los datos correctos

3. **Genera los tests usando Jest + TypeScript**, con:
   - Mocks de Prisma (sin tocar DB real)
   - `describe/it` con nombres claros
   - `beforeEach` para resetear mocks
   - `expect` bien definidos y precisos
   - Comentarios cortos explicativos por bloque

4. **Genera y valida** el archivo `tests/tests-JGG.test.ts`.
5. **No incluyas explicaciones externas** fuera del bloque del archivo.

---

## *Requisitos técnicos obligatorios*

- Tests unitarios puros (sin integración real).
- Uso correcto de `jest.mock()` o un mock manual de Prisma Client.
- Estilo TS estricto, imports correctos.
- Cobertura de todas las ramas de decisión.
- Mantener independencia del entorno (no ejecutar código real de Prisma).
- No inventar lógica: **solo testear lo que realmente existe**.

---

## *Criterios de calidad*

El archivo generado debe reflejar:

- Claridad
- Correcta estructura Jest
- Rigor técnico
- Alineación total con el código disparador
- Uso adecuado de mocks
- Expresividad en nombres de tests
- Cobertura completa de validaciones + escenarios límite

---

## *Salida final esperada*

Un único fichero `tests/tests-JGG.test.ts` completo y con los tests pasando.

---
```

### Salida generación de tests unitarios

Genera el fichero de la entrega correctamente, pero al ejecutar los tests, da error de compilación. Esto es debido a que NO hay configuración de jest en el proyecto, por lo que fuerzo con el siguiente prompt a configurar y ejecutar los tests para verificar que pasan correctamente.

## Prompt configuración de Jest

Reutilizo el mismo contexto del prompt anterior.

```markdown
Los tests están fallando. Debes ejecutar los tests y verificar que pasan correctamente. Si no es así, corrígelos. Si tienes que modificar algo de los tests, básate siempre en la implementación real, no en la implementación de los tests.
```

## Salida configuración de Jest

Genera tanto el fichero de jest.config.js y ejecuta todos los tests correctamente. En este punto, paso a validarlos manualmente.
