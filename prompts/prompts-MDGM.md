# Initialize

We are using ts-jest, initialize the frontend testing environment with jest and ts-jest so that the configuration file is created and the necessary dependencies are installed, use the image to install dependencies, I am using pnpm instead of npm.

# create unit tests

## Task
Act as an expert software developer and unit test developer, using jest create the unit tests for inserting candidates into the database inside the tests-MDGM.test.ts file located under the "backend/src/tests" folder. Follow best practices for creating unit tests, including but not limited to: clear and descriptive test names, setup and teardown processes, mocking dependencies, and covering edge cases. Ensure that the tests are isolated, repeatable, and provide meaningful assertions to validate the expected behavior of the candidate insertion functionality.  The tests should cover various scenarios, including successful insertions, handling of invalid data, and any relevant business logic associated with candidate insertion. Provide comments within the test code to explain the purpose of each test and any important considerations, it should also cover all involved functions and methods related to candidate insertion.

## Best practices

Follow the best practices for unit testing in JavaScript/TypeScript using Jest, also install the required dependencies for mocking prisma database calls so that the unit tests are isolated from the database, run faster and do not have data dependencies:
1. Convención de Nombres 
Utiliza nombres de funciones de prueba descriptivos que indiquen claramente lo que cada prueba está verificando.

2. Patrón Arrange-Act-Assert (AAA)
Estructura tus pruebas con la configuración (arrange), invocación (act) y afirmación (assert) para mejorar su legibilidad, y que sean más claras y mantenibles.

Arrange (Organizar o Preparar): En esta parte del test, se configura todo lo necesario para realizar el test. Esto incluye la creación de objetos, configuración de dependencias, preparación del entorno de datos, y todo lo necesario para que el test pueda ejecutarse.
Act (Actuar): Esta es la parte donde se ejecuta la funcionalidad que se desea testear. Generalmente consiste en una llamada a un método o función con los parámetros preparados en la fase de Arrange.
Assert (Afirmar): Finalmente, en esta etapa se verifica que la acción realizada ha tenido los efectos esperados. Esto se hace mediante afirmaciones (assertions) que comparan los resultados obtenidos con los resultados esperados.
3. Parametrización
Para las pruebas que siguen un patrón similar pero usan diferentes entradas, considera parametrizarlas para evitar la duplicación de código.

// reverseString.test.js
 const reverseString = require('./reverseString');
 
 describe('Pruebas para la función reverseString', () => {
     // Define los casos de prueba como un array de arrays, donde cada subarray contiene los argumentos para cada test y el resultado esperado
     const testCases = [
         ["hello", "olleh"],
         ["world", "dlrow"],
         ["", ""],
         ["a", "a"],
         ["hello, world!", "!dlrow ,olleh"]
     ];
 
     test.each(testCases)('La inversión de "%s" debe ser "%s"', (input, expected) => {
         expect(reverseString(input)).toBe(expected);
     });
 });
 
 


4. Mensajes de Afirmación
Los mensajes opcionales en las afirmaciones pueden ser útiles, especialmente cuando una prueba falla, para entender rápidamente qué salió mal.

// reverseString.test.js
 const reverseString = require('./reverseString');
 
 describe('Pruebas para la función reverseString con parametrización', () => {
     const testCases = [
         ["hello", "olleh", "Al invertir 'hello', el resultado debe ser 'olleh'"],
         ["world", "dlrow", "Al invertir 'world', el resultado debe ser 'dlrow'"],
         ["", "", "Al invertir una cadena vacía, el resultado debe ser también una cadena vacía"],
         ["a", "a", "Al invertir 'a', el resultado debe ser 'a'"],
         ["hello, world!", "!dlrow ,olleh", "Al invertir 'hello, world!', el resultado debe ser '!dlrow ,olleh'"]
     ];
 
     test.each(testCases)(
         'La inversión de "%s" debe ser "%s"', 
         (input, expected, message) => {
             expect(reverseString(input)).toBe(expected, message);
         }
     );
 });
 
 
5. Pruebas de Casos Límite
Es crucial pensar y probar los casos límite, no solo el camino feliz. Esto ayuda a asegurar que tu función sea robusta y maneje todas las entradas esperadas de manera elegante. De hecho, con el auge de la IA, las pruebas más obvias serán algo asumido en el desarrollo, y usaremos nuestro conocimiento del problema y experiencia previa para centrarnos en casos no tan obvios. 

Por ejemplo, si estamos realizando una aplicación para digitalizar la operativa de clínicas médicas, podemos pedir a la IA que saque múltiples casos de validación de cada uno de los campos de cada uno de los formularios de datos (textos, números, fechas, emails, direcciones...). Sin embargo, es improbable que, sin todo el contexto del problema, sepa que no puede haber 2 registros para el mismo usuario ya que el historial clínico es único. Es en esa lógica de negocio y casos atípicos donde tendremos que enfocarnos.

En cualquier caso, la IA, dado el contexto adecuado, también puede darnos visibilidad de casos límite que quizá no habíamos planteado, actuando en este caso como potenciador de nuestra creatividad.

Mock de la base de datos
Lo ideal cuando las pruebas unitarias requieren interacción con base de datos, es mockearla para no alterar los datos. 

Los tests unitarios no deben depender de otros componentes (son los tests de integración los que sí dependen de otros).  En nuestros tests unitarios, solo queremos testear el comportamiento de nuestro componente, nos da absolutamente igual qué ocurre en capas inferiores como la de la base de datos. 

Vamos a verlo con el ejemplo de LTI:

Si queremos validar, por ejemplo, la creación correcta de un candidato cuando se introducen todos los datos requeridos y sin errores de formato, podemos tener la tentación de crear un test que cree esos datos. Sin embargo,  estaremos introduciendo nueva información en la base de datos que luego habrá que borrar si queremos que el test siga pasando. Si no, no podremos verificar el ID asignado en cada ejecución de los tests, ya que deberíamos ir cambiándolo. O incluso dará error por encontrar datos repetidos una vez pasado el test la primera vez, en caso de que haya alguna validación de integridad, como emails únicos. 
https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client
