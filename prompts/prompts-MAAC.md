# Asistente: Github copilot desde VSCode

# Prompts:
```
Goal: Eres un ingeniero de software senior especializado en pruebas unitarias con **Jest** y código en **TypeScript**. Tu tarea es analizar e implementar pruebas unitarias para código existente, generando test cases sólidos y bien estructurados.

Context: Soy un estudiante principiante en ingeniería de software con conocimientos básicos de TypeScript y Jest. Necesito ayuda para crear pruebas unitarias correctas, completas y fundamentadas, pero **no quiero que me expliques paso a paso lo que haces durante el proceso**. Únicamente quiero al final un **resumen general** de lo que se hizo y una explicación clara de las pruebas unitarias generadas. Si se proporcionan archivos o fragmentos de código, debes integrarlos directamente en la solución.

Format of the response:
- Primero **genera un plan detallado** de lo que harás (sin explicar tu razonamiento interno).
- Luego **ejecuta el plan** generando las pruebas unitarias usando TypeScript + Jest.
- Usa bloques de código bien formateados.
- Al final, incluye **un resumen general**, explicando por qué las pruebas creadas validan correctamente el comportamiento del código.
- No incluyas narración de tu razonamiento ni explicaciones paso a paso del proceso, solo el resultado final y el resumen.

Constraints:
- Explica siempre desde fundamentos cuando corresponda (por ejemplo, qué valida una prueba, qué significa mockear, por qué una aserción es necesaria).
- No asumas conocimientos avanzados.
- Todas las pruebas deben ser rigurosas, claras y cubrir casos relevantes.
- Si se proporciona código fuente, **debes referenciarlo explícitamente** dentro de las pruebas y tu explicación final.
- Usa TypeScript y Jest estrictamente.

Proof & Reasoning Requirement:
- Toda función o módulo probado debe incluir pruebas que cubran:
  - Comportamiento esperado.
  - Casos límite.
  - Casos de error si aplican.
- Justifica cada grupo de tests en el resumen final.

Reference Integration:
- Si adjunto archivos o fragmentos de código, intégralos directamente en tu análisis y en la escritura de las pruebas.
```

```
## Objetivo
Crear una **suite de tests unitarios en Jest** para la funcionalidad de **inserción de candidatos en base de datos**.

---

## Instrucciones

### 1. Archivo de salida
Todos los tests deben generarse dentro del archivo:

### 2. Comentarios descriptivos por test
Antes de cada test incluye un comentario que describa:

- Qué funcionalidad o escenario se está probando  
- Los criterios de aceptación aplicables  
- Qué caso límite, escenario alterno o riesgo cubre  

### 3. Requisitos de los tests
Los tests deben:

- Validar que los **criterios de aceptación se cumplen**  
- Aplicar **buenas prácticas de testing** (AAA pattern, mocks adecuados, claridad, aislamiento)  
- Incluir **casos positivos, negativos y casos límite relevantes**  
- Mockear dependencias externas (bases de datos, repositorios, servicios externos)  
- Usar datos simulados (fixtures) en lugar de datos reales  

Cantidad requerida de tests:

- **Mínimo:** 5  
- **Máximo:** 10  

### 4. Formato esperado de salida
Debes entregar **solamente el contenido del archivo**:
```
