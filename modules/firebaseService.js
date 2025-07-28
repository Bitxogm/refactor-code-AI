// modules/firebaseService.js (Actualizado)
// Este módulo se encarga de la inicialización de Firebase y de proporcionar las instancias de sus servicios.

// Importa la configuración de Firebase desde el archivo renombrado.
// Esta es la configuración específica para la rama 'modularizacion'.
import { firebaseConfig } from '../firebaseConfigMod.js';

// Importa las funciones necesarias del SDK de Firebase.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Variables globales para almacenar las instancias de Firebase.
// Estas serán exportadas para que otros módulos puedan utilizarlas.
let app;
let db;
let auth;
let isInitialized = false;

/**
 * Inicializa la aplicación Firebase con la configuración proporcionada.
 * Esta función se encarga de configurar la conexión a Firebase.
 * También intenta iniciar sesión con un token personalizado si está disponible.
 */
async function initializeFirebase() {
    if (isInitialized) return;
    try {
        // Determina la configuración a usar: la global (si viene del entorno Canvas)
        // o la importada localmente (para desarrollo fuera de Canvas).
        const currentFirebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfig;
        // Obtiene el token de autenticación inicial del entorno Canvas, si existe.
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        // Inicializa la aplicación Firebase.
        app = initializeApp(currentFirebaseConfig);
        // Obtiene la instancia de Firestore (base de datos).
        db = getFirestore(app);
        // Obtiene la instancia de Auth (autenticación).
        auth = getAuth(app);

        // Si hay un token de autenticación inicial, intenta iniciar sesión con él.
        if (initialAuthToken) {
            try {
                await signInWithCustomToken(auth, initialAuthToken);
                console.log("Inicio de sesión con token personalizado exitoso.");
            } catch (error) {
                console.error("Error al iniciar sesión con token personalizado:", error);
                // Si el token personalizado falla, el módulo de autenticación (authService.js)
                // se encargará de iniciar sesión anónimamente si es necesario.
            }
        }
        isInitialized = true;
        console.log("Firebase inicializado y servicios disponibles.");
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        throw error;
    }
}

// Llama a la inicialización de Firebase cuando la ventana se carga.
// Esto asegura que Firebase esté listo antes de que otros scripts intenten usarlo.
window.addEventListener('load', initializeFirebase);


// Funciones de utilidad para Firestore.
// Estas funciones requieren que 'db' esté inicializado.

/**
 * Obtiene una referencia a una colección pública.
 * Las colecciones públicas son accesibles por cualquier usuario autenticado.
 * @param {string} collectionName El nombre de la colección.
 * @returns {import('firebase/firestore').CollectionReference} La referencia a la colección.
 */
const getPublicCollectionRef = (collectionName) => {
    // Obtiene el ID de la aplicación del entorno Canvas o usa un valor por defecto.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Construye la ruta de la colección pública.
    return collection(db, `/artifacts/${appId}/public/data/${collectionName}`);
};

/**
 * Obtiene una referencia a una colección privada del usuario actual.
 * Las colecciones privadas solo son accesibles por el usuario propietario.
 * @param {string} collectionName El nombre de la colección.
 * @returns {import('firebase/firestore').CollectionReference|null} La referencia a la colección o null si el usuario no está disponible.
 */
const getPrivateCollectionRef = (collectionName) => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Importante: El ID del usuario ahora se obtiene de authService.js
    // Aseguramos que 'auth' esté disponible antes de intentar obtener el usuario.
    const currentUserId = auth.currentUser?.uid; // Usamos auth.currentUser directamente aquí.
    if (!currentUserId) {
        console.error("Error: No se puede obtener la colección privada. Usuario no autenticado o ID no disponible.");
        return null;
    }
    // Construye la ruta de la colección privada.
    return collection(db, `/artifacts/${appId}/users/${currentUserId}/${collectionName}`);
};

/**
 * Añade un nuevo documento a una colección.
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @param {Object} data Los datos del documento a añadir.
 * @returns {Promise<string>} El ID del documento recién creado.
 */
const addDocument = async (collectionRef, data) => {
    try {
        const docRef = await addDoc(collectionRef, data);
        console.log("Documento añadido con ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error al añadir documento: ", e);
        throw e;
    }
};

/**
 * Establece (crea o sobrescribe) un documento con un ID específico.
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @param {string} docId El ID del documento.
 * @param {Object} data Los datos del documento a establecer.
 * @returns {Promise<void>}
 */
const setDocument = async (collectionRef, docId, data) => {
    try {
        await setDoc(doc(collectionRef, docId), data);
        console.log("Documento establecido con ID: ", docId);
    } catch (e) {
        console.error("Error al establecer documento: ", e);
        throw e;
    }
};

/**
 * Actualiza los campos de un documento existente.
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @param {string} docId El ID del documento a actualizar.
 * @param {Object} data Los datos a actualizar en el documento.
 * @returns {Promise<void>}
 */
const updateDocument = async (collectionRef, docId, data) => {
    try {
        await updateDoc(doc(collectionRef, docId), data);
        console.log("Documento actualizado con ID: ", docId);
    } catch (e) {
        console.error("Error al actualizar documento: ", e);
        throw e;
    }
};

/**
 * Elimina un documento de una colección.
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @param {string} docId El ID del documento a eliminar.
 * @returns {Promise<void>}
 */
const deleteDocument = async (collectionRef, docId) => {
    try {
        await deleteDoc(doc(collectionRef, docId));
        console.log("Documento eliminado con ID: ", docId);
    } catch (e) {
        console.error("Error al eliminar documento: ", e);
        throw e;
    }
};

/**
 * Obtiene un documento por su ID.
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @param {string} docId El ID del documento a obtener.
 * @returns {Promise<Object|null>} Los datos del documento incluyendo su ID, o null si no existe.
 */
const getDocumentById = async (collectionRef, docId) => {
    try {
        const docSnap = await getDoc(doc(collectionRef, docId));
        if (docSnap.exists()) {
            console.log("Datos del documento:", docSnap.data());
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No existe tal documento!");
            return null;
        }
    } catch (e) {
        console.error("Error al obtener documento: ", e);
        throw e;
    }
};

/**
 * Obtiene todos los documentos de una colección (una sola vez, sin escuchar cambios).
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @returns {Promise<Array<Object>>} Un array de objetos, cada uno representando un documento con su ID y datos.
 */
const getAllDocuments = async (collectionRef) => {
    try {
        const querySnapshot = await getDocs(collectionRef);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        console.log("Todos los documentos:", documents);
        return documents;
    } catch (e) {
        console.error("Error al obtener todos los documentos: ", e);
        throw e;
    }
};

/**
 * Escucha cambios en una colección en tiempo real.
 * @param {import('firebase/firestore').CollectionReference} collectionRef La referencia a la colección.
 * @param {function(Array<Object>): void} callback La función a llamar con los datos actualizados de la colección.
 * @returns {function(): void} Una función para desuscribir el observador.
 */
const listenToCollection = (collectionRef, callback) => {
    if (!db) {
        console.error("Firestore no está inicializado. No se puede escuchar la colección.");
        return () => {}; // Devuelve una función vacía para evitar errores.
    }
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        const docs = [];
        snapshot.forEach(doc => {
            docs.push({ id: doc.id, ...doc.data() });
        });
        callback(docs);
    }, (error) => {
        console.error("Error al escuchar la colección:", error);
    });
    return unsubscribe; // Devuelve la función para desuscribirse.
};

// Exportar las instancias de Firebase y las funciones de utilidad.
// 'app', 'db', y 'auth' se exportan para que otros módulos puedan acceder a ellos
// una vez que initializeFirebase() se haya completado.
export {
    app, // La instancia de la aplicación Firebase.
    db,  // La instancia de Firestore.
    auth, // La instancia de autenticación.
    initializeFirebase, // Función para inicializar Firebase.
    getPublicCollectionRef,
    getPrivateCollectionRef,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    getAllDocuments,
    listenToCollection
};
