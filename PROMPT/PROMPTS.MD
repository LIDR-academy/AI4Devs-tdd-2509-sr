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

1) utiliza los criterios de aceptación definidos en el archivo api-spec.yaml
2) Aunque son para front-end, grabalos en el archivo backend/src/tests/tests-PAQ.test.ts
3) CObertura de tests : solo incluye Componentes (AddCandidateForm, FileUploader, RecruiterDashboard) y Validaciones de formulario
4) sin casos límites
5) Utiliza JEST ya instalado
