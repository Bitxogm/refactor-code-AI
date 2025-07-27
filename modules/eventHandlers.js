//eventHandlers.js

// Importa los editores desde el servicio de editores de código
import { inputEditor, editor, unitTestsCodeEditor } from './codeEditorService.js';
// Importa la función para actualizar el estado
import { updateStatus } from './statusMessages.js';

/**
 * Maneja la carga de archivos. Lee el contenido del archivo y lo carga en el editor de entrada.
 * @param {Event} event - El evento de cambio del input de archivo.
 */
export function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (inputEditor) {
                inputEditor.setValue(e.target.result);
                updateStatus('Archivo cargado correctamente en el editor de entrada.', 'success');
            } else {
                updateStatus('Error: Editor de entrada no inicializado para cargar el archivo.', 'error');
            }
        };
        reader.onerror = () => {
            updateStatus('Error al leer el archivo.', 'error');
        };
        reader.readAsText(file);
    } else {
        updateStatus('No se seleccionó ningún archivo.', 'warning');
    }
}


export  function processRefactoredCode(code) {
  // Limpia contenido anterior
  exampleCodeElement.textContent = '';
  suggestionList.innerHTML = '';
  exampleSection.classList.add("hidden");
  suggestionSection.classList.add("hidden");


  // Busca el ejemplo de uso
  const exampleMatch = code.match(/(?:\/\/\s*Ejemplo|\/\*\s*Ejemplo)[\s\S]*?([\s\S]*?)(?=\n\n|\Z)/i);
  if (exampleMatch && exampleMatch[1]) {
    exampleCodeElement.textContent = exampleMatch[1].replace(/^[\s]+/gm, '');
    exampleSection.classList.remove("hidden");
  }

  // Busca comentarios de mejora
  const suggestions = code.matchAll(/\/\/\s*[Mm]ejora:\s*(.*)/g);
  for (const match of suggestions) {
    const li = document.createElement("li");
    li.textContent = match[1];
    suggestionList.appendChild(li);
  }

  if (suggestionList.children.length > 0) {
    suggestionSection.classList.remove("hidden");
  }
}

 export function handleCopyRefactoredCode() {
  if (copyRefactoredCodeButton && copyFeedbackMessage) {
    copyRefactoredCodeButton.addEventListener("click", function () {
      // Usa CodeMirror para obtener el valor
      const codeToCopy = editor ? editor.getValue() : '';

      // --- INICIO DE CONSOLE.LOGS Y MEDIDA DE TIEMPO ---
      console.log("DEBUG: Iniciando copia de código refactorizado.");
      console.log(`DEBUG: Tamaño del código a copiar: ${codeToCopy.length} caracteres.`);

      // Registra el tiempo de inicio de la operación de copia
      const startTime = performance.now();
      // --- FIN DE CONSOLE.LOGS Y MEDIDA DE TIEMPO ---

      // Copia el texto al portapapeles
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          // --- CONSOLE.LOG DE ÉXITO ---
          const endTime = performance.now();
          console.log(`DEBUG: Copia al portapapeles completada en ${(endTime - startTime).toFixed(2)} ms.`);
          // --- FIN CONSOLE.LOG DE ÉXITO ---

          // Muestra el mensaje de "Copiado!"
          copyFeedbackMessage.classList.remove("opacity-0");
          copyFeedbackMessage.classList.add("opacity-100");

          // Lo oculta después de 2 segundos
          setTimeout(() => {
            copyFeedbackMessage.classList.remove("opacity-100");
            copyFeedbackMessage.classList.add("opacity-0");
          }, 2000);
        })
        .catch(err => {
          // --- CONSOLE.LOG DE ERROR ---
          const endTime = performance.now();
          console.error(`DEBUG: Error al copiar el texto en ${(endTime - startTime).toFixed(2)} ms:`, err);
          // --- FIN CONSOLE.LOG DE ERROR ---

          alert("Hubo un problema al copiar el código.");
        });
    });
  }
}

export function handleCopyUnitTests() {
  // Obtener referencias a los elementos del DOM para los tests unitarios
  // ¡Estos IDs son los que me proporcionaste: copyUnitTestButton y unitTestCopyMessage!
  const copyUnitTestButton = document.getElementById('copyUnitTestButton');
  const unitTestCopyMessage = document.getElementById('unitTestCopyMessage');

  if (copyUnitTestButton && unitTestCopyMessage) {
    copyUnitTestButton.addEventListener("click", function () {
      // Usa CodeMirror para obtener el valor del editor de tests unitarios
      const testsToCopy = unitTestsCodeEditor ? unitTestsCodeEditor.getValue() : '';

      console.log("DEBUG: Iniciando copia de tests unitarios.");
      console.log(`DEBUG: Tamaño de los tests a copiar: ${testsToCopy.length} caracteres.`);

      const startTime = performance.now();

      navigator.clipboard.writeText(testsToCopy)
        .then(() => {
          const endTime = performance.now();
          console.log(`DEBUG: Copia de tests al portapapeles completada en ${(endTime - startTime).toFixed(2)} ms.`);

          // Muestra el mensaje de "Copiado!"
          unitTestCopyMessage.classList.remove("opacity-0");
          unitTestCopyMessage.classList.add("opacity-100");

          // Lo oculta después de 2 segundos
          setTimeout(() => {
            unitTestCopyMessage.classList.remove("opacity-100");
            unitTestCopyMessage.classList.add("opacity-0");
          }, 2000);
        })
        .catch(err => {
          const endTime = performance.now();
          console.error(`DEBUG: Error al copiar los tests en ${(endTime - startTime).toFixed(2)} ms:`, err);
          // Importante: No usar alert(). Mostrar un mensaje en la UI o solo en consola.
          console.error("Hubo un problema al copiar los tests unitarios.");
        });
    });
  } else {
    console.error("DEBUG: No se encontraron los elementos HTML para copiar los tests unitarios.");
  }
}

export function handleCopyUnitTests() {
  // Obtener referencias a los elementos del DOM para los tests unitarios
  // ¡Estos IDs son los que me proporcionaste: copyUnitTestButton y unitTestCopyMessage!
  const copyUnitTestButton = document.getElementById('copyUnitTestButton');
  const unitTestCopyMessage = document.getElementById('unitTestCopyMessage');

  if (copyUnitTestButton && unitTestCopyMessage) {
    copyUnitTestButton.addEventListener("click", function () {
      // Usa CodeMirror para obtener el valor del editor de tests unitarios
      const testsToCopy = unitTestsCodeEditor ? unitTestsCodeEditor.getValue() : '';

      console.log("DEBUG: Iniciando copia de tests unitarios.");
      console.log(`DEBUG: Tamaño de los tests a copiar: ${testsToCopy.length} caracteres.`);

      const startTime = performance.now();

      navigator.clipboard.writeText(testsToCopy)
        .then(() => {
          const endTime = performance.now();
          console.log(`DEBUG: Copia de tests al portapapeles completada en ${(endTime - startTime).toFixed(2)} ms.`);

          // Muestra el mensaje de "Copiado!"
          unitTestCopyMessage.classList.remove("opacity-0");
          unitTestCopyMessage.classList.add("opacity-100");

          // Lo oculta después de 2 segundos
          setTimeout(() => {
            unitTestCopyMessage.classList.remove("opacity-100");
            unitTestCopyMessage.classList.add("opacity-0");
          }, 2000);
        })
        .catch(err => {
          const endTime = performance.now();
          console.error(`DEBUG: Error al copiar los tests en ${(endTime - startTime).toFixed(2)} ms:`, err);
          // Importante: No usar alert(). Mostrar un mensaje en la UI o solo en consola.
          console.error("Hubo un problema al copiar los tests unitarios.");
        });
    });
  } else {
    console.error("DEBUG: No se encontraron los elementos HTML para copiar los tests unitarios.");
  }
}