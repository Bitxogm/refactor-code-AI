// modules/main.js

import { updateStatus } from './statusMessages.js';
import { initializeFirebase, db, auth } from './firebaseService.js';
import { login, authProviders, subscribeToAuthChanges, logout } from './authService.js';
import { initializeCodeMirror, inputEditor, editor, unitTestsCodeEditor } from './codeEditorService.js';
import { handleFileUpload, handleCopyRefactoredCode, handleCopyUnitTests, handleDownloadRefactoredCode, handleDownloadUnitTests, updateLanguageDisplays } from './eventHandlers.js';
import { handleRefactorButton } from './refactoringLogic.js';

async function initializeApplication() {
    try {
        // 1. Inicializar Firebase
        await initializeFirebase();
        updateStatus('Firebase inicializado', 'info');

        // 2. Inicializar CodeMirror
        initializeCodeMirror();
        updateStatus('Editores de código listos', 'info');

        // 3. Obtener referencias a los elementos de la interfaz
        const loginWithGoogleButton = document.getElementById('loginWithGoogleButton');
        const loginAnonymouslyButton = document.getElementById('loginAnonymouslyButton');
        const loginButtonsContainer = document.getElementById('loginButtonsContainer');
        const logoutButton = document.getElementById('logoutButton');
        const userDisplay = document.getElementById('userDisplay');
        const fileInput = document.getElementById('fileInput');
        const refactorButton = document.getElementById('refactorButton');
        const loadingIndicator = document.getElementById('loading-indicator');
        const languageSelector = document.getElementById('languageSelector');
        const outputLanguageSelector = document.getElementById('outputLanguageSelector');
        const analysisModeSelector = document.getElementById('analysisMode');
        const refactoringSummaryOutput = document.getElementById('refactoringSummaryOutput');
        const securityAnalysisOutput = document.getElementById('securityAnalysisOutput');
        const flowchartDescriptionOutput = document.getElementById('flowchartDescriptionOutput');

        // 4. Conectar los botones a las funciones de autenticación
        if (loginAnonymouslyButton) {
            loginAnonymouslyButton.addEventListener('click', async () => {
                try {
                    await login(authProviders.ANONYMOUS);
                    console.log("Login anónimo exitoso.");
                } catch (error) {
                    console.error("Fallo el login anónimo:", error);
                }
            });
        }

        if (loginWithGoogleButton) {
            loginWithGoogleButton.addEventListener('click', async () => {
                try {
                    await login(authProviders.GOOGLE);
                    console.log("Usuario autenticado con Google.");
                } catch (error) {
                    console.error("Fallo el login con Google:", error);
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    await logout();
                    console.log("Sesión cerrada.");
                } catch (error) {
                    console.error("Fallo el logout:", error);
                }
            });
        }

        // 5. Suscribirse a los cambios de estado de autenticación para actualizar la interfaz
        subscribeToAuthChanges(user => {
            if (user) {
                userDisplay.textContent = `Hola, ${user.displayName || user.email || 'Anónimo'}`;
                loginButtonsContainer.style.display = 'none';
                logoutButton.style.display = 'inline-block';
            } else {
                userDisplay.textContent = '';
                loginButtonsContainer.style.display = 'block';
                logoutButton.style.display = 'none';
            }
        });

        // 6. Configurar otros listeners
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
        }

        updateLanguageDisplays(languageSelector, outputLanguageSelector);
        if (languageSelector) {
            languageSelector.addEventListener('change', () => {
                updateLanguageDisplays(languageSelector, outputLanguageSelector);
            });
        }
        if (outputLanguageSelector) {
            outputLanguageSelector.addEventListener('change', () => {
                updateLanguageDisplays(languageSelector, outputLanguageSelector);
            });
        }

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

        handleCopyRefactoredCode();
        handleCopyUnitTests();
        handleDownloadRefactoredCode();
        handleDownloadUnitTests();

    } catch (error) {
        console.error('Error en inicialización:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApplication);