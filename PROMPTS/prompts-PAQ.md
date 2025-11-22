# Prompts PAQ

Este archivo contiene prompts y documentación relacionada con el proyecto.

---

## Historial de Prompts

---

### Prompt 1 - 2025-01-22
**Tipo:** Generación de Tests Unitarios Frontend

Eres un experto en testing javascript. dado el contexto explicitado en el archivo #README.MD escribe tests unitarios que garanticen que los criterios de aceptación se cumplen, exclusivamente para la parte de front-end. 

Utiliza buenas prácticas de testing en la medida de lo posible, y añade todos los casos límite que consideres. 

Añade comentarios para aclarar a qué criterio de aceptación se refiere cada test. 

realizame todas las preguntas que consideres necesarias antes de proceder.

graba toda la codificación en el archivo test-PAQ.test.ts que generaste anteriormente.

---

### Prompt 2 - 2025-01-22
**Tipo:** Respuestas a Consultas sobre Tests

procedo a responder tus consultas:

1) Aunque son para front-end, grabalos en el archivo backend/src/tests/tests-PAQ.test.ts

2) utiliza Jest + React Testing Library. considero que como experto en JavaScript no tienes dificultad en dominar estas herramientas de front-end

3) Mockeas las llamadas a AddCandidateForm.js y FileUploader.js. con jest.fn() o jest.spyon()

4) utiliza el jest.config.js configurado en lugar del react-scripts.

5) utiliza los criterios de aceptación definidos en el archivo api-spec.yaml

6) Testea solo los componentes React, en otro paso testearemos los servicios.

7) Caso límite o validación especial : que el mail ya está ingresado en otro candidato

---

### Prompt 3 - 2025-01-22
**Tipo:** Generación de Tests Unitarios Backend

ahora te consulto como experto en backend y testeos de typescript. 

dado los mismos archivos de contexto y criterios de aceptación utilizados anteriormente, escribe tests unitarios para la programación del backend. 

Utiliza buenas prácticas de testing en la medida de lo posible, y añade todos los casos límite que consideres. 

Añade comentarios para aclarar a qué criterio de aceptación se refiere cada test. 

realizame todas las preguntas que consideres necesarias antes de proceder.

graba toda la codificación en el archivo test-PAQ.test.ts que generaste anteriormente.

---

### Prompt 4 - 2025-01-22
**Tipo:** Respuestas a Consultas sobre Tests Backend

paso a responder tus consultas:

utiliza el mismo archivo backend/src/tests/tests-PAQ.test.ts , agregando acá los nuevos testeos, SIN BORRAR los anteriores

testea los seis archivos que mencionas. los modelos de dominio los dejamos para más adelante

mockea Prisma Client

utiliza jest.mock()

solo testea los controladores directamente

utiliza el mismo jest.config.js

como casos límites considera que no existe la base de datos, o alguna de las tablas invocadas

no instales ninguna dependencia adicional. si no puedes ejecutar un test porque es imprescindible alguna de estas dependencias, simplemente comentalo.

---

### Prompt 5 - 2025-01-22
**Tipo:** Revisando archivo de testing tests.PAQ.test.ts

estoy observando que todos los comandos it() que invocan a "renderWithRouter" dan error de sintaxis. ¿Me puedes indicar el motivo y después los ajustamos?

---

### Prompt 6 - 2025-01-22
**Tipo:** Rehacer el testing sin validar acceso a Datos (mockear)

ahora te pido que quites del testeo todo aquello que exija hacer un mockeo de prisma. es decir, que se testee sólamente aqueillo que corresponde al front-end, sin necesidad de simular el acceso a la base de datos