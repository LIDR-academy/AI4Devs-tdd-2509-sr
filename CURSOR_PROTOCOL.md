# Protocolo de Uso de Cursor (Balanceado)

Este repositorio utiliza un flujo de seguridad explícito para trabajar con herramientas de IA.

## Política de ramas

- `main` es inmutable
- `dev-luhz` es la base estable de desarrollo
- Las ramas `checkpoint/*` nunca deben modificarse
- Los cambios generados por IA SOLO están permitidos en ramas `test/cursor-session-01`

## Reglas obligatorias

1. Nunca modificar `main`, `dev-luhz` ni `checkpoint/*`
2. Antes de hacer cualquier cambio, confirmar la rama actual
3. Si la rama actual NO es `test/cursor-session-01`, DETENERSE
4. No refactorizar código a menos que se solicite explícitamente
5. No eliminar archivos a menos que se solicite explícitamente
6. Mantener los cambios pequeños y bien delimitados
7. Si las instrucciones no son claras, preguntar antes de continuar

## Flujo de trabajo

Antes de programar:
- Leer este archivo
- Confirmar la rama actual de git
- Proponer un plan breve de ejecución

Después de programar:
- Resumir los cambios realizados
- Listar los archivos modificados

## Acciones permitidas

- Leer y analizar el código
- Proponer cambios
- Implementar funcionalidades solicitadas de forma aislada

## Acciones prohibidas

- Refactors masivos
- Renombrar carpetas
- Cambiar la estructura del proyecto sin aprobación explícita
