

import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { firebaseApp } from './firebaseService.js';

let currentUserId = null;

// Exporta las constantes para que otros módulos las puedan usar
export const authProviders = {
  ANONYMOUS: 'anonymous',
  GOOGLE: 'google.com',
  EMAIL: 'password'
};

/**
 * Función genérica para iniciar sesión con diferentes proveedores.
 * @param {string} provider - El proveedor de autenticación (e.g., 'anonymous', 'google.com').
 * @param {object} credentials - Credenciales opcionales para proveedores como email/password.
 */
async function login(provider = authProviders.ANONYMOUS, credentials = null) {
  try {
    const auth = getAuth(firebaseApp);
    if (!auth) throw new Error("Auth no inicializado");
    
    let userCredential;
    
    switch (provider) {
      case authProviders.ANONYMOUS:
        userCredential = await signInAnonymously(auth);
        break;
        
      case authProviders.GOOGLE:
        const googleProvider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, googleProvider);
        break;
        
      // Puedes añadir más casos aquí en el futuro
        
      default:
        throw new Error(`Proveedor no soportado: ${provider}`);
    }
    
    currentUserId = userCredential.user.uid;
    return currentUserId;
    
  } catch (error) {
    console.error(`Error en autenticación (${provider}):`, error);
    throw error;
  }
}

function getUserId() {
    return currentUserId;
}

function subscribeToAuthChanges(callback) {
    const auth = getAuth(firebaseApp);
    return onAuthStateChanged(auth, (user) => {
        currentUserId = user ? user.uid : null;
        callback(user);
    });
}

/**
 * Cierra la sesión del usuario actual.
 */
async function logout() {
  const auth = getAuth(firebaseApp);
  try {
    await signOut(auth);
    console.log("Sesión cerrada.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
}


export { 
  login,
  getUserId,
  subscribeToAuthChanges,
  logout
};