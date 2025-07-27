// modules/main.js

// Importa las funciones de inicialización de los editores
import { initializeCodeMirror } from './codeEditorService.js';
// Importa la función para actualizar el estado
import { updateStatus } from './statusMessages.js';
// Importa las funciones de servicio de Firebase
// ¡IMPORTANTE! db, auth, userId se importan como enlaces a las variables let exportadas.
// NO DEBEN SER REASIGNADAS CON 'let' o 'const' AQUÍ.
import { initializeFirebase, db, auth, userId } from './firebaseService.js';
// Importa las funciones de manejo de eventos
import { handleFileUpload } from './eventHandlers.js';

/**
 * Inicializa la aplicación.
 * Configura CodeMirror, Firebase y los listeners de eventos.
 */
async function initializeApplication() {
    try {
        // 1. Inicializar CodeMirror
        initializeCodeMirror();
        console.log('Editores CodeMirror inicializados correctamente.');
        updateStatus('Editores de código listos.', 'info');

        // 2. Inicializar Firebase
        // initializeFirebase() asigna los valores a las variables db, auth, userId
        // dentro del módulo firebaseService.js. Como se exportan como 'let',
        // sus valores actualizados son accesibles directamente aquí después de la llamada.
        await initializeFirebase();


        if (db && auth) { // Verificar si las instancias están disponibles
            console.log('Firebase inicializado correctamente.');
            updateStatus(`Conectado a Firebase. ID de usuario: ${userId}`, 'success');
            console.log("Firestore DB:", db);
            console.log("Firebase Auth:", auth);
            console.log("Current User ID:", userId);
        } else {
            console.error('Error: Las instancias de Firebase (db, auth) no están disponibles.');
            updateStatus('Error al inicializar Firebase. Revisa la consola para más detalles.', 'error');
        }


        // 3. Configurar listeners de eventos
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
            console.log('Listener para carga de archivo configurado.');
        } else {
            console.warn('Elemento fileInput no encontrado en el DOM.');
        }

        updateStatus('Aplicación cargada y modularización en progreso.', 'info');

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        updateStatus(`Error crítico al iniciar: ${error.message}`, 'error');
    }
}

// Asegura que la aplicación se inicialice cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApplication);
