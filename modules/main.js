// modules/main.js

import { updateStatus } from './statusMessages.js';
import { initializeFirebase, db, auth } from './firebaseService.js';
import { login, authProviders, subscribeToAuthChanges } from './authService.js';
import { initializeCodeMirror, inputEditor, editor, unitTestsCodeEditor } from './codeEditorService.js';
import { handleFileUpload, handleCopyRefactoredCode, handleCopyUnitTests, handleDownloadRefactoredCode, handleDownloadUnitTests } from './eventHandlers.js';
import { handleRefactorButton } from './refactoringLogic.js';

async function initializeApplication() {
    try {
        // 1. Inicializar CodeMirror
        initializeCodeMirror();
        updateStatus('Editores de código listos', 'info');

        // 2. Inicializar Firebase
        await initializeFirebase();

        // 3. Autenticación anónima
        const userId = await login(authProviders.ANONYMOUS);
        updateStatus('Autenticando...', 'info');

        if (!userId) {
            throw new Error("No se pudo autenticar");
        }

        updateStatus(`Usuario conectado (anónimo): ${userId}`, 'success');
        console.log("ID de usuario:", userId);


        // 4. Configurar listeners
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
        }

        // Configurar el botón de refactorizar y otros elementos
        const refactorButton = document.getElementById('refactorButton');
        const loadingIndicator = document.getElementById('loading-indicator'); // <-- Corregido aquí
        const languageSelector = document.getElementById('languageSelector');
        const outputLanguageSelector = document.getElementById('outputLanguageSelector');
        const analysisModeSelector = document.getElementById('analysisMode'); // <-- Corregido aquí
        const refactoringSummaryOutput = document.getElementById('refactoringSummaryOutput');
        const securityAnalysisOutput = document.getElementById('securityAnalysisOutput');
        const flowchartDescriptionOutput = document.getElementById('flowchartDescriptionOutput');

        if (refactorButton) {
            handleRefactorButton({
                db: db,
                updateStatus: updateStatus,
                loadingIndicator: loadingIndicator,
                refactorButton: refactorButton,
                languageSelector: languageSelector,
                outputLanguageSelector: outputLanguageSelector,
                analysisModeSelector: analysisModeSelector,
                inputEditor: inputEditor,
                editor: editor,
                unitTestsCodeEditor: unitTestsCodeEditor,
                refactoringSummaryOutput: refactoringSummaryOutput,
                securityAnalysisOutput: securityAnalysisOutput,
                flowchartDescriptionOutput: flowchartDescriptionOutput
            });
        }

        // 6. Configurar los botones de copiar
        handleCopyRefactoredCode();
        handleCopyUnitTests();

        // 7. Configurar los botones de descarga
        handleDownloadRefactoredCode();
        handleDownloadUnitTests();


        // 8. Opcional: Escuchar cambios de autenticación
        subscribeToAuthChanges((user) => {
            console.log("Cambio en estado de autenticación:", user ? user.uid : "null");
        });

    } catch (error) {
        console.error('Error en inicialización:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initializeApplication);