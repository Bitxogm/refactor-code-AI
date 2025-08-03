
// modules/firebaseService.js

import { firebaseConfig } from '../firebaseConfigMod.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

export let firebaseApp;
export let db;
export let auth;
export let isInitialized = false;

export async function initializeFirebase() {
    if (isInitialized) return;
    try {
        const currentFirebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfig;
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        firebaseApp = initializeApp(currentFirebaseConfig);
        db = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);

        if (initialAuthToken) {
            try {
                await signInWithCustomToken(auth, initialAuthToken);
                console.log("Inicio de sesión con token personalizado exitoso.");
            } catch (error) {
                console.error("Error al iniciar sesión con token personalizado:", error);
            }
        }
        isInitialized = true;
        console.log("Firebase inicializado y servicios disponibles.");
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        throw error;
    }
}

window.addEventListener('load', initializeFirebase);

// ... (El resto de tus funciones de utilidad para Firestore, pero asegúrate de que usen 'db' y 'auth' correctamente)