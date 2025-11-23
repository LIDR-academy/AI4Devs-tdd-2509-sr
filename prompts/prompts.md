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

Ten en cuenta que son tests unitarios del servicio. eso quiere decir que unicamente se debe falsear infraestructura, en este caso, únicamente la base de datos (gestionada con prisma).

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

## Prompt de eliminación de mocks

En la revisión manual (y generación de cobertura), veo que están todas las dependencias mockeadas, incluidos los servicios relacionados. Por ello, me dispongo a corregirlo.

```markdown
Ten en cuenta que son tests unitarios del servicio. eso quiere decir que unicamente se debe falsear infraestructura, en este caso, la base de datos (gestionada con prisma). Elimina los mocks de los servicios relacionados y haz mock unicamente de prisma
```

### Salida de eliminación de mocks

En este punto, encuentro revisando la cobertura un bug en el código entregado. En el constructor de Candidates, está leyendo de los datos introducidos por parámetros las propiedades education y workExperience, en lugar de education**s** y workExperience**s**. Al ser arrays hay que copiarlos a la entidad.

Funcionaba porque el servicio se encargaba también de guardarlo. Esto parece código restante de una refactorización o de una iteración de IA, por lo que aquí tengo 2 opciones: ignorarlo o eliminar el código sobrante. Opto por la segunda opción, haciendo que permanezca la parte de la gestión dentro del Candidate. El motivo es porque, desde mi perspectiva, el candidato debería hacer de agregado raíz (en términos de DDD) y no permitir a los casos de uso que "hablen con extraños". La opción de dejar el manejo de la base de datos en el servicio también sería válida. Entonces, elimino todo lo del servicio y lanzo el prompt para ajustar los tests (ya que mockean llamadas a prisma que ya no van a ocurrir).

## Prompt de refactorización de tests unitarios

```markdown
Había código redundante en el proyecto: se estaban gestionando las relaciones con los Candidate desde dentro de Candidate.save y desde el servicio. He eliminado la parte del servicio y varios tests fallan porque mockeaban las llamadas explicitas a prisma. Corrígelos y asegura que los assert verifican la entidad Candidate y sus relaciones.
```

### Salida de refactorización de tests unitarios

La salida de este último prompt es un fichero de tests más corto, más legible y con un mayor ratio de cobertura. Aún así, detecto que hay una parte que NO se está cubriendo en los tests y es la que tiene que ver con los Resumes.

## Prompt de generación de tests de aceptación

```markdown
Ahora implementa los tests de aceptación. Para eso, deberás levantar un servidor de testing, lanzar una petición http con los .json y verificar la salida. son tests de api, caja negra, así que deberían tener la configuración más cercana a la de producción (la que ya tenga configurada  el servicio).
Es necesario testear todos los endpoint pero solo 1 happy path y 1 corner case para asegurar la gestión de erroers
```

### Salida de generación de tests de aceptación

Genera el fichero acceptance.test.ts. Este fichero ejecuta tests de aceptación aumentando la cobertura a la capa de los endpoints. Es entonces cuando veo que hay también en esta capa código duplicado: route.ts y candidateController.ts.

## Mejoras adicionales no implementadas

Se podría refactorizar todos los tests para incluir builders u object mothers con fake para hacer los tests más legibles y más robustos.

## Problemas encontrados

- Código sin funcionar debido al uso de `any` en el constructor de Candidate.ts.
- Lógica duplicada debido al punto anterior: se gestionan las entidades relacionadas a Candidate tanto dentro de este (método save) como desde el servicio. Eliminando la parte del servicio, las otras entidades se quedan mucho más livianas, lo mismo que el servicio.
- Lógica de Resumes no utilizada desde el front. Como no hay tipado, no se "detecta" si no lo buscas.
- En el front, también hay lógica duplicada. He visto fetch a candidates y lo mismo con axios en un servicio. Además, el App.tsx es el de por defecto de React y esto no se renderiza cuando se carga, así que supongo que es código restante.
