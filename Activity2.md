✍️ Creación de tests unitarios para LTI 🔴
Mentor
Daniel Zaragoza
 
⏱️ La fecha límite es domingo 23 de noviembre al final del día, independientemente del país.
Ya has realizado una versión básica de la funcionalidad de inserción de nuevos candidatos. Se trata de un componente clave de un ATS, ya que los datos de candidatos son el activo más valioso. En el ejercicio se utilizaba un formulario web para insertar nuevos candidatos, que puede ser una interfaz muy útil para RRHH y hiring managers, pero se recibirán via API desde múltiples fuentes, como aplicación directa del candidato, o sistemas de parsing automatizado.

En este ejercicio, vamos a ver el potencial que tiene aplicar TDD para garantizar que el sistema se comporta como debe.

1. Descarga el repositorio base de Github
Apóyate en el repositorio base del ejercicio anterior, ya con jest incorporado:

AI4Devs-tdd


2. Realiza el ejercicio
Tu misión será crear una suite de tests unitarios en Jest para la funcionalidad de insertar candidatos en base de datos. Apóyate en la IA y utiliza el contexto del proyecto para identificar aquellos tests que puedan ser relevantes en este caso.

Pista 1: hay 2 familias principales de tests, recepción de los datos del formulario, y guardado en la base de datos. Queremos ver tests que cubran ambos procesos con al menos un test.

Recuerda usar solo plugins como Copilot o IDEs con IA como Cursor, ya no trabajaremos con chatbots.

Aplica las buenas prácticas aprendidas en este módulo siempre que sea posible.

No olvides revisar lo que te devuelve el asistente y retocarlo para adaptarlo a tus necesidades, corrigiendo o incluso borrando lo que consideres adecuado. 

(BONUS) Aunque para esta sesión no es necesario, si alguno de los tests requiere modificar algo en base de datos, recuerda que lo ideal cuando las pruebas unitarias requieren interacción con base de datos, es mockearla para no alterar los datos. Puedes encontrar más información para este caso concreto en la documentación de prisma (https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o#mock-prisma-client)



3. Entrega el ejercicio
Esperamos tu entrega como un pull request en el repositorio que solo incluya:

Los tests en un fichero tests-iniciales.test.ts en la carpeta backend/src/tests 
Un fichero prompts-iniciales.md en la carpeta prompts.
Para ello, debes seguir los siguientes pasos una vez ya tengas el repositorio preparado como se ha explicado en el paso anterior:

Completar el ejercicio: rellenar el prompt y el archivo de test
Crear una nueva rama para tu entregable con el nombre tests-iniciales
Hacer commit
⁠Git push
En la interfaz de tu repositorio te saldrá un aviso arriba para hacer ⁠Pull request
En caso de que falle, puedes enviar el proyecto en zip por correo a alvaro@lidr.co

Si tienes dudas sobre el ejercicio, consúltalas en el grupo de whatsapp para que podamos apoyarte lo más rápido posible, y que otr@s compañer@s también la resuelvan.

Por último, no olvides añadir tus prompts en prompts.md dentro de tu carpeta.  

¡A por ello!