# Documentación: tests-PAQ.test.ts

## Descripción

Este archivo contiene los tests unitarios para los componentes del frontend, basados en los criterios de aceptación definidos en `api-spec.yaml`. Aunque los tests están ubicados en el directorio `backend/src/tests/`, validan la lógica de validación de formularios que se utiliza en los componentes del frontend.

## Ubicación

- **Archivo**: `backend/src/tests/tests-PAQ.test.ts`
- **Framework**: Jest con TypeScript (ts-jest)

## Componentes Testeados

### 1. AddCandidateForm
Formulario para agregar candidatos con validaciones completas según `api-spec.yaml`.

### 2. FileUploader
Componente para subir archivos CV con validación de tipos permitidos.

### 3. RecruiterDashboard
Dashboard del reclutador con funcionalidad para navegar a añadir candidatos.

## Criterios de Aceptación Validados

Los tests validan los siguientes criterios de aceptación según `api-spec.yaml`:

### firstName
- **minLength**: 2
- **maxLength**: 50
- **pattern**: `^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$`

### lastName
- **minLength**: 2
- **maxLength**: 50
- **pattern**: `^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$`

### email
- **pattern**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

### phone
- **pattern**: `^\+?\d{1,3}?[- .]?\(?(?:\d{2,3})\)?[- .]?\d\d\d[- .]?\d\d\d\d$`
- **Opcional**: Sí

### address
- **maxLength**: 100
- **Opcional**: Sí

### educations
- **institution**: maxLength 100
- **title**: maxLength 100
- **startDate**: pattern `^\d{4}-\d{2}-\d{2}$`
- **endDate**: pattern `^\d{4}-\d{2}-\d{2}$`

### workExperiences
- **company**: maxLength 100
- **position**: maxLength 100
- **description**: maxLength 200
- **startDate**: pattern `^\d{4}-\d{2}-\d{2}$`
- **endDate**: pattern `^\d{4}-\d{2}-\d{2}$`

### cv
- **Tipos permitidos**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Estructura de los Tests

### Funciones de Validación

El archivo incluye funciones helper que implementan las validaciones según `api-spec.yaml`:

- `validateFirstName(value: string): boolean`
- `validateLastName(value: string): boolean`
- `validateEmail(value: string): boolean`
- `validatePhone(value: string): boolean`
- `validateAddress(value: string): boolean`
- `validateEducation(education: any): boolean`
- `validateWorkExperience(experience: any): boolean`
- `validateCV(fileType: string): boolean`
- `validateAddCandidateForm(candidate: any): { isValid: boolean; errors: string[] }`
- `validateFileUploader(fileType: string): boolean`

### Grupos de Tests

1. **AddCandidateForm - Validaciones según api-spec.yaml**
   - Validación de firstName
   - Validación de lastName
   - Validación de email
   - Validación de phone
   - Validación de address
   - Validación de educations
   - Validación de workExperiences
   - Validación de CV
   - Validación completa del formulario

2. **FileUploader - Validaciones según api-spec.yaml**
   - Validación de tipos de archivo permitidos

3. **RecruiterDashboard - Funcionalidad según criterios de aceptación**
   - Validación de funcionalidad del dashboard

4. **Validaciones combinadas del formulario completo**
   - Validación de candidato completo válido
   - Validación de candidato con datos inválidos

## Ejecución de los Tests

Para ejecutar los tests, utiliza el siguiente comando desde el directorio `backend`:

```bash
npm test
```

O para ejecutar solo este archivo:

```bash
npm test tests-PAQ.test.ts
```

## Notas Importantes

1. Los tests validan la lógica de validación, no los componentes de React directamente, ya que están ubicados en el backend.

2. Las funciones de validación implementan exactamente los criterios definidos en `api-spec.yaml`.

3. Todos los tests incluyen comentarios que indican a qué criterio de aceptación se refieren.

4. Los tests cubren casos válidos e inválidos para cada campo según las reglas de validación.

5. Se incluyen tests para validaciones combinadas que verifican múltiples campos a la vez.

## Dependencias

- `jest`: Framework de testing
- `ts-jest`: Preset de Jest para TypeScript
- `@types/jest`: Tipos de TypeScript para Jest

## Configuración

El archivo `jest.config.js` en el directorio `backend` configura Jest para trabajar con TypeScript. El `tsconfig.json` ha sido actualizado para incluir los tipos de Jest y las librerías ES2015+ necesarias.

