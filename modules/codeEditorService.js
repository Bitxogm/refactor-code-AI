// Variables de los editores de texto , para poder exportarlas y asignarles valores
export let editor; // Editor de salida (código refactorizado)
export let inputEditor; // Editor de entrada (código original)
export let unitTestsCodeEditor; // Editor de analisis

// Esta funcion , se llama cuando el DOM este cargado.
export function initializeCodeMirror() {
  // Obtener referencias a los selectores de lenguaje dentro de este módulo
  const languageSelector = document.getElementById('languageSelector');
  const outputLanguageSelector = document.getElementById("outputLanguageSelector");

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
      readOnly: false, // Es editable
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
  } else {
    console.error("Error: Contenedor 'input-editor-container' no encontrado.");
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
    editor.setSize("100%", "auto"); // 'auto' es a menudo mejor con contenedores con altura CSS
    editor.setValue('El código refactorizado aparecerá aquí...'); // Placeholder inicial
  } else {
    console.error("Error: Contenedor 'editor-container' no encontrado.");
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
  } else {
    console.error("Error: Contenedor 'unitTestsEditorContainer' no encontrado.");
  }
}