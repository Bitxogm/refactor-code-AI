// modules/authService.js

import { auth } from './firebaseService.js';
import { signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';

let currentUserId = null;

const authProviders = {
  ANONYMOUS: 'anonymous',
  GOOGLE: 'google.com',
  EMAIL: 'password'
  // Puedes añadir más después: FACEBOOK, TWITTER, etc.
};

// Reemplaza tu función loginAnonymously por esto:
async function login(provider = authProviders.ANONYMOUS, credentials = null) {
  try {
    if (!auth) throw new Error("Auth no inicializado");
    
    let userCredential;
    
    switch (provider) {
      case authProviders.ANONYMOUS:
        userCredential = await signInAnonymously(auth);
        break;
        
      // ¡Aquí añadiremos otros casos después!
      // case authProviders.GOOGLE: ...
      // case authProviders.EMAIL: ...
        
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
    return onAuthStateChanged(auth, (user) => {
        currentUserId = user ? user.uid : null;
        callback(user);
    });
}

export { 
  login,  // En lugar de loginAnonymously
  getUserId,
  subscribeToAuthChanges,
  authProviders  // Exportamos los tipos para usarlos en la UI
};