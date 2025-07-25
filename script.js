// === CONFIGURACIÓN DE FIREBASE ===
// Esta es la configuración de tu proyecto en Firebase.
// La encontrarás en tu Consola de Firebase -> Project settings -> General -> Your apps -> Web
// script.js
firebase.initializeApp(firebaseConfig);


//Declarar db en scope global 
let db;



// Verifica si los SDK de Firebase están cargados correctamente
if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
  console.error("Los SDK de Firebase no se han cargado correctamente en index.html.");
  alert("Error: Los componentes esenciales de Firebase no están disponibles. Revisa tu index.html.");
} else { // Inicializa Firebase con la configuración definida arriba
  firebase.initializeApp(firebaseConfig);

  // Obtiene una referencia a Firestore para interactuar con la base de datos
  db = firebase.firestore();
}


// === REFERENCIAS A LOS ELEMENTOS DEL DOM ===
const refactorButton = document.getElementById('refactorButton');
const statusMessage = document.getElementById('status-message');
const loadingIndicator = document.getElementById('loading-indicator');

// Elementos nuevos:
const languageSelector = document.getElementById('languageSelector');
const outputLanguageSelector = document.getElementById("outputLanguageSelector");
const fileInput = document.getElementById("fileInput");
const copyRefactoredCodeButton = document.getElementById("copyRefactoredCodeButton");
const copyFeedbackMessage = document.getElementById("copy-feedback-message");
const copyUnitTestButton = document.getElementById("copyUnitTestButton");
const unitTestCopyMessage = document.getElementById("unitTestCopyMessage")
const analysisModeSelector = document.getElementById("analysisMode");

const exampleSection = document.getElementById("example-section");
const exampleCodeElement = document.getElementById("example-code");
const suggestionSection = document.getElementById("suggestion-section");
const suggestionList = document.getElementById("suggestion-list");

// ... (otras variables) ...

let editor; // Editor de salida (código refactorizado)
let inputEditor; // Editor de entrada (código original)
let unitTestsCodeEditor; // Editor de analisis



// === FUNCIONES PRINCIPALES ===

/**
 * Actualiza el mensaje de estado mostrado al usuario.
 * @param {string} message - El mensaje que quieres mostrar.
 * @param {string} type - Tipo de mensaje: 'info', 'success' o 'error'.
 */

/**
 * Inicializa las instancias de CodeMirror para los editores de código.
 */
function initializeCodeMirror() {
  // --- INICIALIZAR EL EDITOR DE CÓDIGO ORIGINAL (inputEditor) EN EL DIV ---
  const inputEditorContainer = document.getElementById('input-editor-container');
  if (inputEditorContainer) {
    // Si ya hay una instancia de CodeMirror, la destruimos para evitar duplicados
    if (inputEditor) {
      inputEditorContainer.innerHTML = ''; // Limpiar el contenedor antes de re-inicializar
    }

    inputEditor = CodeMirror(inputEditorContainer, { // Inicializa CodeMirror DENTRO del div
      mode: "javascript", // Modo por defecto al iniciar
      lineNumbers: true,
      theme: "dracula",
      readOnly: false,// Es editable
      lineWrapping: true
    });
    // Ajustar el tamaño para que CodeMirror ocupe el 100% del contenedor h-96
    inputEditor.setSize("100%", "auto");

    // Establecer el placeholder y gestionar los eventos de focus/blur
    inputEditor.setValue('Pega tu código aquí para refactorizar...');
    inputEditor.on("focus", function (instance) {
      if (instance.getValue() === 'Pega tu código aquí para refactorizar...') {
        instance.setValue('');
      }
    });
    inputEditor.on("blur", function (instance) {
      if (instance.getValue() === '') {
        instance.setValue('Pega tu código aquí para refactorizar...');
      }
    });

    // Establecer el modo correcto basado en el selector de lenguaje
    // Esto es importante para que el resaltado de sintaxis funcione
    if (languageSelector && languageSelector.value) {
      inputEditor.setOption("mode", languageSelector.value);
    } else {
      inputEditor.setOption("mode", "javascript"); // Fallback
    }
  }

  // --- INICIALIZAR EL EDITOR PRINCIPAL PARA EL CÓDIGO REFACTORIZADO (editor) EN EL DIV ---
  const refactoredEditorContainer = document.getElementById('editor-container'); // Usamos el ID del div
  if (refactoredEditorContainer) {
    // Limpia el contenido previo del contenedor
    refactoredEditorContainer.innerHTML = '';
    editor = CodeMirror(refactoredEditorContainer, {
      mode: "javascript", // <-- ¡ASEGURAMOS UN MODO POR DEFECTO!
      lineNumbers: true,
      theme: "dracula",
      readOnly: true,
      lineWrapping: true // Este editor es de solo lectura
    });
    // ! Importante: La altura del contenedor DIV debe ser establecida por CSS (h-96)
    // CodeMirror respetará la altura de su contenedor padre si se establece en el CSS.
    // Si el div ya tiene 'h-96' (384px), esto funcionará bien.
    editor.setSize("100%", "auto"); // 'auto' es a menudo mejor con contenedores con altura CSS
    editor.setValue('El código refactorizado aparecerá aquí...'); // Placeholder inicial
  }

  // --- INICIALIZAR EL EDITOR PARA LOS TESTS UNITARIOS (unitTestsCodeEditor) ---
  const unitTestsEditorContainer = document.getElementById('unitTestsEditorContainer');
  if (unitTestsEditorContainer) {
    // Limpia el contenido previo del contenedor para asegurar una inicialización limpia
    unitTestsEditorContainer.innerHTML = '';
    unitTestsCodeEditor = CodeMirror(unitTestsEditorContainer, { // ¡Inicializamos CodeMirror directamente en el DIV!
      mode: "javascript", // Puedes cambiar a "python" o el modo que esperes para los tests
      lineNumbers: true,
      theme: "dracula",
      readOnly: true, // Este editor es de solo lectura
      lineWrapping: true
    });
    unitTestsCodeEditor.setSize("100%", unitTestsEditorContainer.style.height || "384px"); // Ajusta el tamaño
    unitTestsCodeEditor.setValue('Los tests unitarios aparecerán aquí...'); // Placeholder inicial

    // Forzar la aplicación del tema y el refresco (por si acaso)
    unitTestsCodeEditor.setOption("theme", "dracula");
    unitTestsCodeEditor.refresh();
  }
}

/**
   Muestra ejemplo de uso y sugerencias educativas debajo del código.
 */
function processRefactoredCode(code) {
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

function updateStatus(message, type = 'info') {
  statusMessage.textContent = message;
  // Cambia el color del texto según el tipo de mensaje
  statusMessage.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'blue');
}

/**
 * Maneja la carga de archivos locales desde el sistema del usuario.
 * Permite que el contenido del archivo se muestre en el textarea.
 */

function handleFileUpload() {
  if (fileInput && inputEditor) {
    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
      if (!file) return; // Si no hay archivo, no hagas nada
      const reader = new FileReader(); // Creador de lectura de archivos

      // Cuando termine de leer el archivo...
      reader.onload = function (e) {
        // Usa CodeMirror para establecer el valor
        inputEditor.setValue(e.target.result);
        // Muestra un mensaje de éxito
        updateStatus("Archivo cargado correctamente.", "success");
      };

      // Si ocurre un error leyendo el archivo...
      reader.onerror = function (e) {
        updateStatus("Error al leer el archivo.", "error");
      };

      // Lee el archivo como texto plano
      reader.readAsText(file);
    });
  }
}



function handleCopyRefactoredCode() {
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

// --- NUEVA FUNCIÓN para copiar los tests unitarios ---
function handleCopyUnitTests() {
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
/**
 * Maneja el evento del botón de refactorizar.
 * Envía el código a Firestore y espera el resultado.
 */
function handleRefactorButton() {


  // Si el usuario elige "mismo que entrada", usamos el mismo lenguaje

  refactorButton.addEventListener('click', async () => {
    if (!db) {
      updateStatus("Firebase no está disponible. No se puede enviar el código.", "error");
      return;
    }
    //Lee los valores del DOM
    const selectedLanguage = languageSelector.value;
    const selectedOutputLanguage = outputLanguageSelector.value;
    const analysisMode = analysisModeSelector.value;

    //Calcula el lenguaje final de salida
    const finalOutputLanguage = selectedOutputLanguage === "same" ? selectedLanguage : selectedOutputLanguage;

    //Muestra los valores selecccionados
    document.getElementById("input-lang-display").textContent = selectedLanguage;
    document.getElementById("output-lang-display").textContent = finalOutputLanguage;
    const originalCode = inputEditor ? inputEditor.getValue().trim() : '';

    // Valida que haya código introducido
    if (!originalCode) {
      updateStatus('Por favor, pega código en el área de entrada.', 'error');
      return;
    }

    // Limpia el área de salida y muestra mensajes de estado
    updateStatus('Enviando código para refactorizar...', 'info');
    loadingIndicator.style.display = 'block'; // Mostrar animación de carga
    refactorButton.disabled = true; // Deshabilitar botón mientras se procesa

    try {
      // Enviar el código a Firestore
      const docRef = await db.collection('code_submissions').add({
        originalCode: originalCode,
        status: 'pending', // Estado inicial
        submissionTime: firebase.firestore.FieldValue.serverTimestamp(), // Hora del servidor
        inputLanguage: selectedLanguage,
        outputLanguage: finalOutputLanguage,
        analysisMode: analysisMode,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()

      });

      console.log("Input Language:", selectedLanguage);
      console.log("Output Language:", finalOutputLanguage);

      updateStatus(`Código enviado. ID de la tarea: ${docRef.id}. Esperando refactorización...`, 'info');

      // Escuchar cambios en este documento hasta que tenga el resultado
      const unsubscribe = docRef.onSnapshot(docSnapshot => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          console.log(data)

          if (data && data.status === 'completed') {
            // Asegura que los modos de lenguaje de los editores de salida sean correctos antes de establecer el valor
            // Esto es importante por si el modo cambió mientras se esperaba la respuesta del agente
            const currentInputLanguage = languageSelector.value;
            const currentOutputLanguage = outputLanguageSelector.value === "same" ? currentInputLanguage : outputLanguageSelector.value;


            // 1. Mostrar código refactorizado en el editor principal
            if (editor) {
              // --- INICIO DEL CÓDIGO REEMPLAZADO ---
              const { cleanedCode, inlineComments } = processRefactoredCodeForComments(data.refactoredCode || '');

              editor.setValue(cleanedCode);
              editor.setOption("mode", currentOutputLanguage);

              // Añadir los comentarios extraídos como widgets
              addInlineCommentsToEditor(editor, inlineComments);
            }


            // 2. Mostrar resumen de refactorización en el elemento <pre>
            // Usamos .textContent para evitar problemas de inyección de HTML
            document.getElementById('refactoringSummaryOutput').textContent = data.refactoringSummary || 'No hay resumen disponible.';

            // 3. Mostrar código de tests unitarios en su editor CodeMirror
            if (unitTestsCodeEditor) {
              unitTestsCodeEditor.setValue(data.unitTests || '// No se recibieron tests unitarios.');
              unitTestsCodeEditor.setOption("mode", currentOutputLanguage); // Asume que los tests están en el mismo lenguaje de salida
            }

            // 4. Mostrar análisis de seguridad en el elemento <pre>
            document.getElementById('securityAnalysisOutput').textContent = data.securityAnalysis || 'No hay análisis de seguridad disponible.';

            // 5. Mostrar descripción del diagrama de flujo en el elemento <pre>
            document.getElementById('flowchartDescriptionOutput').textContent = data.flowchartDescription || 'No hay descripción de diagrama de flujo disponible.';

            // --- HABILITAR Y AJUSTAR EL PROCESAMIENTO DE COMENTARIOS EN LÍNEA ---
            if (editor && data.refactoredCodeCommentsRaw) { // Cambiamos a refactoredCodeCommentsRaw
              addInlineCommentsToEditor(editor, data.refactoredCodeCommentsRaw);
            } else {
              // Si no hay comentarios o el campo no existe, asegurarnos de limpiar cualquier comentario anterior
              if (editor) {
                editor.getAllMarks().forEach(mark => mark.clear());
                editor.eachLine(line => editor.removeLineClass(line, 'background', 'cm-highlighted-line'));
              }
            }

            updateStatus('¡Refactorización completada con éxito!', 'success');
            loadingIndicator.style.display = 'none';
            refactorButton.disabled = false;
            unsubscribe(); // Dejar de escuchar cuando termina
          }

          // Si hubo un error, muestra el mensaje
          // Dentro de handleRefactorButton, en la sección de onSnapshot
          // ...
          else if (data && data.status === 'error') {
            // Asegúrate de que el editor de salida existe antes de intentar establecer su valor
            if (editor) {
              editor.setValue(`Error: ${data.errorMessage || 'Error desconocido.'}`);
            }
            updateStatus('Ocurrió un error durante la refactorización.', 'error');
            loadingIndicator.style.display = 'none';
            refactorButton.disabled = false;
            unsubscribe(); // Detener escucha
          }
          // ...

        } else {
          // Si el documento no existe, avisa al usuario
          updateStatus('Error: El documento de la tarea no se encontró.', 'error');
          loadingIndicator.style.display = 'none';
          refactorButton.disabled = false;
          unsubscribe(); // Detener escucha
        }
      }, err => {
        // Error al escuchar el documento
        console.error("Error escuchando el documento:", err);
        updateStatus(`Error en la escucha de la tarea: ${err.message}`, 'error');
        loadingIndicator.style.display = 'none';
        refactorButton.disabled = false;
      });

    } catch (error) {
      // Error al enviar el documento a Firestore
      console.error("Error al añadir el documento a Firestore:", error);
      updateStatus(`Error general al enviar la tarea: ${error.message}`, 'error');
      loadingIndicator.style.display = 'none';
      refactorButton.disabled = false;
    }
  });
}
// // Si el código fue refactorizado, muéstralo

/**
 * Procesa el código refactorizado para extraer comentarios de línea marcados
 * con //! y devuelve el código limpio y los comentarios.
 * @param {string} refactoredCode - El código refactorizado potencialmente con comentarios incrustados.
 * @returns {{cleanedCode: string, inlineComments: Array<{lineNumber: number, text: string, type: string}>}}
 */
function processRefactoredCodeForComments(refactoredCode) {
  const lines = refactoredCode.split('\n');
  const cleanedLines = [];
  const inlineComments = [];

  // Expresión regular para encontrar el patrón //! (type): text al final de una línea
  // Captura el tipo (info|warning|error) y el texto del comentario
  const commentRegex = /\s*\/\/!\s*\((info|warning|error)\):\s*(.*)$/;

  lines.forEach((line, index) => {
    const match = line.match(commentRegex);
    if (match) {
      // Si encontramos un comentario marcado
      const type = match[1]; // 'info', 'warning', 'error'
      const text = match[2].trim(); // El texto del comentario
      const cleanedLine = line.replace(commentRegex, '').trim(); // Eliminar el comentario de la línea

      // Añadir el comentario a nuestra lista
      inlineComments.push({
        lineNumber: index + 1, // Número de línea base 1
        text: text,
        type: type
      });

      // Añadir la línea limpia (sin el comentario //! )
      cleanedLines.push(cleanedLine);
    } else {
      // Si no hay un comentario marcado, añadir la línea tal cual
      cleanedLines.push(line);
    }
  });

  return {
    cleanedCode: cleanedLines.join('\n'),
    inlineComments: inlineComments
  };
}

/**
 * Añade comentarios en línea (widgets o marcadores) a un editor CodeMirror.
 * @param {CodeMirror.Editor} cmEditor - La instancia del editor CodeMirror.
 * @param {Array<Object>} comments - Un array de objetos { lineNumber: number, text: string, type: string }.
 */
function addInlineCommentsToEditor(cmEditor, comments) {
  // Limpiamos cualquier marcador o widget anterior para evitar duplicados.
  cmEditor.getAllMarks().forEach(mark => mark.clear());
  cmEditor.eachLine(line => cmEditor.removeLineClass(line, 'background', 'cm-highlighted-line')); // Limpiar resaltados

  if (!comments || comments.length === 0) {
    return; // Si no hay comentarios, salimos.
  }

  comments.forEach(comment => {
    const cmLine = comment.lineNumber - 1; // CodeMirror usa índice base 0

    // Aseguramos que la línea existe en el editor
    if (cmLine >= 0 && cmLine < cmEditor.lineCount()) {
      // Crea el elemento DIV para el widget de línea
      const widget = document.createElement('div');
      widget.className = `cm-inline-comment cm-inline-comment-${comment.type || 'info'}`;
      widget.textContent = `ⓘ ${comment.text}`;

      // Añade el widget a la línea especificada
      cmEditor.addLineWidget(cmLine, widget, {
        coverGutter: false,
        above: false,
        noHScroll: true
      });

      // Resalta la línea completa donde se hizo el comentario
      cmEditor.addLineClass(cmLine, 'background', 'cm-highlighted-line');
    }
  });

  // Asegurarse de que CodeMirror redibuje el contenido
  cmEditor.refresh();
}

function addInlineCommentsToEditor(cmEditor, comments) {
  // Limpia cualquier marca anterior
  cmEditor.getAllMarks().forEach(mark => mark.clear());
  cmEditor.eachLine(line => cmEditor.removeLineClass(line, 'background', 'cm-highlighted-line'));

  // Limitar el número de comentarios para evitar sobrecarga del DOM
  const maxCommentsToShow = 100; // Puedes ajustar este número
  const commentsToProcess = comments.slice(0, maxCommentsToShow);

  commentsToProcess.forEach(comment => {
    // Asegúrate de que el número de línea es válido
    if (comment.lineNumber > 0) {
      const lineHandle = cmEditor.getLineHandle(comment.lineNumber - 1); // CodeMirror es base 0
      if (lineHandle) {
        const lineWidget = document.createElement("div");
        lineWidget.className = `cm-inline-comment cm-inline-comment-${comment.type || 'info'}`;
        lineWidget.textContent = `// ${comment.text}`;
        cmEditor.addLineWidget(lineHandle, lineWidget);
        cmEditor.addLineClass(lineHandle, 'background', 'cm-highlighted-line');
      }
    }
  });

  // Opcional: Si hay más comentarios de los que se muestran, puedes añadir un mensaje
  if (comments.length > maxCommentsToShow) {
    console.warn(`Se han omitido ${comments.length - maxCommentsToShow} comentarios en línea para mejorar el rendimiento.`);
    // Podrías añadir un widget al final del documento o un mensaje de estado
    // updateStatus(`Nota: ${comments.length - maxCommentsToShow} comentarios ocultos por rendimiento.`, 'info');
  }
}




// === INICIALIZACIÓN ===
// Este evento se ejecuta cuando el documento HTML está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Iniciar todas las funciones principales
  initializeCodeMirror();
  handleFileUpload();           // Función para cargar archivos
  handleRefactorButton();      // Función para enviar código a refactorizar
  handleCopyRefactoredCode();  // Función para copiar al portapapeles
  handleCopyUnitTests();
});















