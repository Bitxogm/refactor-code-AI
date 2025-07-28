// refactoringLogic.js

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

  // Limitar el número de comentarios para evitar sobrecarga del DOM
  const maxCommentsToShow = 100; // Puedes ajustar este número
  const commentsToProcess = comments.slice(0, maxCommentsToShow);

  commentsToProcess.forEach(comment => {
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

  // Opcional: Si hay más comentarios de los que se muestran, puedes añadir un mensaje
  if (comments.length > maxCommentsToShow) {
    console.warn(`Se han omitido ${comments.length - maxCommentsToShow} comentarios en línea para mejorar el rendimiento.`);
  }
}


/**
 * Maneja el evento del botón de refactorizar.
 * Envía el código a Firestore y espera el resultado.
 * @param {Object} dependencies - Objeto con todas las dependencias necesarias.
 * @param {firebase.firestore.Firestore} dependencies.db - Instancia de Firestore.
 * @param {Function} dependencies.updateStatus - Función para actualizar el estado en la UI.
 * @param {HTMLElement} dependencies.loadingIndicator - Elemento HTML del indicador de carga.
 * @param {HTMLElement} dependencies.refactorButton - Botón de refactorizar.
 * @param {HTMLSelectElement} dependencies.languageSelector - Selector de lenguaje de entrada.
 * @param {HTMLSelectElement} dependencies.outputLanguageSelector - Selector de lenguaje de salida.
 * @param {HTMLSelectElement} dependencies.analysisModeSelector - Selector de modo de análisis.
 * @param {CodeMirror.Editor} dependencies.inputEditor - Instancia del editor de código de entrada.
 * @param {CodeMirror.Editor} dependencies.editor - Instancia del editor de código refactorizado.
 * @param {CodeMirror.Editor} dependencies.unitTestsCodeEditor - Instancia del editor de tests unitarios.
 * @param {HTMLElement} dependencies.refactoringSummaryOutput - Elemento para el resumen de refactorización.
 * @param {HTMLElement} dependencies.securityAnalysisOutput - Elemento para el análisis de seguridad.
 * @param {HTMLElement} dependencies.flowchartDescriptionOutput - Elemento para la descripción del diagrama de flujo.
 * @param {Object} dependencies.firebase - El objeto global de Firebase (necesario para FieldValue.serverTimestamp()).
 */
export function handleRefactorButton({
  db,
  updateStatus,
  loadingIndicator,
  refactorButton,
  languageSelector,
  outputLanguageSelector,
  analysisModeSelector,
  inputEditor,
  editor,
  unitTestsCodeEditor,
  refactoringSummaryOutput,
  securityAnalysisOutput,
  flowchartDescriptionOutput,
  firebase // Necesitamos el objeto global de Firebase para FieldValue.serverTimestamp()
}) {

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

    //Muestra los valores seleccionados (estos elementos deben estar en el DOM principal o pasarse)
    // Por ahora, asumimos que se manejan en el script.js principal o se pasan también.
    // Si no se pasan, esto causaría un error. Por simplicidad, los dejamos aquí asumiendo que el script.js principal los maneja.
    // document.getElementById("input-lang-display").textContent = selectedLanguage;
    // document.getElementById("output-lang-display").textContent = finalOutputLanguage;

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
              const { cleanedCode, inlineComments } = processRefactoredCodeForComments(data.refactoredCode || '');

              editor.setValue(cleanedCode);
              editor.setOption("mode", currentOutputLanguage);

              // Añadir los comentarios extraídos como widgets
              addInlineCommentsToEditor(editor, inlineComments);
            }


            // 2. Mostrar resumen de refactorización en el elemento <pre>
            // Usamos .textContent para evitar problemas de inyección de HTML
            if (refactoringSummaryOutput) {
              refactoringSummaryOutput.textContent = data.refactoringSummary || 'No hay resumen disponible.';
            }


            // 3. Mostrar código de tests unitarios en su editor CodeMirror
            if (unitTestsCodeEditor) {
              unitTestsCodeEditor.setValue(data.unitTests || '// No se recibieron tests unitarios.');
              unitTestsCodeEditor.setOption("mode", currentOutputLanguage); // Asume que los tests están en el mismo lenguaje de salida
            }

            // 4. Mostrar análisis de seguridad en el elemento <pre>
            if (securityAnalysisOutput) {
              securityAnalysisOutput.textContent = data.securityAnalysis || 'No hay análisis de seguridad disponible.';
            }


            // 5. Mostrar descripción del diagrama de flujo en el elemento <pre>
            if (flowchartDescriptionOutput) {
              flowchartDescriptionOutput.textContent = data.flowchartDescription || 'No hay descripción de diagrama de flujo disponible.';
            }


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
