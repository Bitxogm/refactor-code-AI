// modules/main.js

import { initializeCodeMirror } from './codeEditorService.js';
import { updateStatus } from './statusMessages.js';
import { initializeFirebase, db, auth } from './firebaseService.js';
import { login, authProviders, subscribeToAuthChanges} from './authService.js';
import { handleFileUpload } from './eventHandlers.js';

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

        // 5. Opcional: Escuchar cambios de autenticación
        subscribeToAuthChanges((user) => {
            console.log("Cambio en estado de autenticación:", user ? user.uid : "null");
        });

    } catch (error) {
        console.error('Error en inicialización:', error);
        updateStatus(`Error: ${error.message}`, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initializeApplication);