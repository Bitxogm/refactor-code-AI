// modules/firebaseService.js

// Importaciones de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ¡NUEVO! Importa la configuración de Firebase desde el archivo de configuración en la raíz
// Asegúrate de que la ruta sea correcta si tu estructura de carpetas es diferente.
import { firebaseConfig } from '../firebase-config.js';

// Variables para las instancias de Firebase y el ID de usuario
// Exportamos estas variables para que otros módulos puedan acceder a ellas después de la inicialización
export let app;
export let db;
export let auth;
export let userId; // Variable para almacenar el ID de usuario actual

/**
 * Inicializa Firebase y configura el estado de autenticación.
 * Esta función debe llamarse una vez al inicio de la aplicación.
 */
export async function initializeFirebase() {
    try {
        // Verifica que la configuración de Firebase esté disponible
        if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
            console.error('Error: La configuración de Firebase no está disponible o está vacía.');
            // Puedes lanzar un error o manejarlo de otra manera si la configuración es crítica
            throw new Error('Firebase configuration is missing or empty.');
        }

        // Inicializa la aplicación de Firebase
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        console.log('Firebase App, Firestore y Auth inicializados.');

        // Autenticación: Intenta iniciar sesión con el token personalizado si está disponible,
        // de lo contrario, inicia sesión anónimamente.
        // La variable __initial_auth_token es proporcionada por el entorno de Canvas.
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log('Sesión iniciada con token personalizado.');
        } else {
            await signInAnonymously(auth);
            console.log('Sesión iniciada anónimamente.');
        }

        // Configura un listener para los cambios de estado de autenticación
        // Esto asegura que userId se actualice cuando el estado de autenticación cambie
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // El usuario está conectado
                userId = user.uid;
                console.log('ID de usuario actualizado:', userId);
            } else {
                // El usuario está desconectado
                userId = crypto.randomUUID(); // Genera un ID aleatorio si no hay usuario autenticado
                console.log('Usuario desconectado, usando ID aleatorio:', userId);
            }
        });

    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        throw error; // Propagar el error para que initializeApplication lo maneje
    }
}

// Nota: Las funciones para interactuar con Firestore (getData, addData, etc.)
// se añadirán aquí o en un módulo separado de 'firestoreService.js' más adelante.
// Por ahora, solo nos enfocamos en la inicialización y la autenticación.
