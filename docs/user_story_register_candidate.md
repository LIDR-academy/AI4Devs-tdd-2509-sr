# Historia de Usuario: Registrar Candidato

**ID:** US-01
**Título:** Registrar un nuevo candidato

## Declaración de la Historia
**Como** Reclutador (Recruiter)
**Quiero** registrar un nuevo candidato en el sistema ingresando sus datos personales, educación, experiencia y CV
**Para** poder gestionar su proceso de selección y tener su información centralizada.

## Criterios de Aceptación

### 1. Información Personal
- El sistema debe permitir ingresar los siguientes datos obligatorios:
  - Nombre (`firstName`)
  - Apellido (`lastName`)
  - Email (`email`)
  - Teléfono (`phone`)
  - Dirección (`address`)
- El sistema debe validar que el formato del email sea válido.
- **Validación de Unicidad:** El sistema no debe permitir registrar dos candidatos con el mismo email. Debe mostrar un mensaje de error claro si esto ocurre.

### 2. Educación
- El sistema debe permitir agregar múltiples registros de educación.
- Para cada registro de educación se debe capturar:
  - Institución (`institution`)
  - Título (`title`)
  - Fecha de inicio (`startDate`)
  - Fecha de fin (`endDate`)

### 3. Experiencia Laboral
- El sistema debe permitir agregar múltiples registros de experiencia laboral.
- Para cada experiencia se debe capturar:
  - Empresa (`company`)
  - Cargo (`position`)
  - Descripción (`description`)
  - Fecha de inicio (`startDate`)
  - Fecha de fin (`endDate`)

### 4. Carga de CV (Curriculum Vitae)
- El sistema debe permitir adjuntar un archivo de CV al perfil del candidato.
- **Formatos permitidos:** PDF (`application/pdf`) y DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- **Restricciones:** El tamaño del archivo no debe exceder los 10MB.
- El archivo debe guardarse en el servidor y asociarse al candidato.

### 5. Respuesta Exitosa
- Al completar el registro exitosamente, el sistema debe devolver un código de estado **201 Created**.
- La respuesta debe incluir la información completa del candidato creado, incluyendo su ID generado por el sistema.

### 6. Manejo de Errores
- Si faltan datos obligatorios o los formatos son incorrectos, el sistema debe devolver un código **400 Bad Request** con detalles del error.
- Si el tipo de archivo del CV no es válido, el sistema debe rechazar la solicitud con un mensaje explicativo.
