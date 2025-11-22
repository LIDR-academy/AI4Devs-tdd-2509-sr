# Tests creados FRONT-END

## RecruiterDashboard Component (3 tests)
Renderizado del dashboard
Visualización del logo LTI
Botón de navegación para añadir candidato

## AddCandidateForm Component (30+ tests)
Cubre los criterios de aceptación de api-spec.yaml:

### Validaciones de campos requeridos:
firstName: requerido, minLength: 2, maxLength: 50, pattern con caracteres españoles
lastName: requerido, minLength: 2, maxLength: 50, pattern con caracteres españoles
email: requerido, formato válido

### Validaciones de campos opcionales:
phone: formato válido (opcional)
address: maxLength: 100 (opcional)

### Educaciones:
Agregar/eliminar educaciones
Validación de institution (maxLength: 100)
Validación de title (maxLength: 100)
Múltiples educaciones

### Experiencias laborales:
Agregar/eliminar experiencias
Validación de company (maxLength: 100)
Validación de position (maxLength: 100)
Múltiples experiencias

### Envío del formulario:
Envío exitoso (201)
Manejo de errores 400 (Bad Request)
Manejo de errores 500 (Internal Server Error)
Caso límite: email duplicado
Manejo de errores de red
Formateo correcto de fechas (YYYY-MM-DD)
Envío sin CV (opcional)
Limpieza de mensajes de error

## FileUploader Component (7 tests)
Renderizado del componente
Selección de archivo
Subida exitosa
Manejo de errores (400, 500)
Estado de carga (spinner)
Visualización del nombre del archivo
Validación: no subir sin archivo
Manejo de errores de red

# Archivos creados/modificados
backend/src/tests/tests-PAQ.test.ts - Tests unitarios completos
jest.config.js - Configuración actualizada para React Testing Library
jest.setup.js - Setup global con mocks necesarios
package.json - Dependencias agregadas

# Características
Comentarios que relacionan cada test con los criterios de api-spec.yaml
Casos límite cubiertos
Mocks de fetch con jest.fn() y jest.spyOn()
Uso de React Testing Library y Jest
Validaciones según api-spec.yaml
Caso especial: email duplicado

# Tests creados BACK_END

## Validator (validateCandidateData) - 25+ tests
Cubre los criterios de api-spec.yaml:

### Validaciones de firstName:
Mínimo 2 caracteres
Máximo 50 caracteres
Caracteres especiales españoles
Rechazo de números
Campo requerido

### Validaciones de lastName:
Mínimo 2 caracteres
Máximo 50 caracteres
Caracteres especiales españoles
Campo requerido

### Validaciones de email:
Formato válido
Rechazo de formato inválido
Campo requerido

### Validaciones de phone (opcional):
Permite vacío
Valida formato cuando está presente
Rechaza formato inválido

### Validaciones de address (opcional):
Permite vacío
Máximo 100 caracteres

### Validaciones de educations:
Datos válidos
Institution máximo 100 caracteres
Title máximo 100 caracteres
Formato de fechas (YYYY-MM-DD)

### Validaciones de workExperiences:
Datos válidos
Company máximo 100 caracteres
Position máximo 100 caracteres
Description máximo 200 caracteres
Formato de fechas

### Validaciones de CV:
Datos válidos
Rechazo sin filePath
Rechazo sin fileType
Campo opcional

## CandidateService (addCandidate) - 8 tests
Creación exitosa de candidato
Creación con educaciones
Creación con experiencias laborales
Creación con CV
Caso límite: email duplicado (P2002)
Caso límite: base de datos no existe
Caso límite: tabla no existe
Validación antes de guardar
## CandidateController (addCandidateController) - 4 tests
Retorna 201 en caso exitoso
Retorna 400 en error de validación
Retorna 400 cuando email duplicado
Manejo de errores desconocidos

## CandidateRoutes
Cubierto por los tests del controlador (las rutas son un wrapper simple)

## FileUploadService
Nota: requiere supertest para testear multer completamente (comentado según instrucciones)

# Características implementadas
Mock de Prisma Client usando jest.mock()
Tests sin borrar los del frontend
Comentarios que relacionan cada test con los criterios de api-spec.yaml
Casos límite: base de datos no existe, tablas no existen, email duplicado
Sin dependencias adicionales instaladas
Tests del controlador directamente (no rutas HTTP)
