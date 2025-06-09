"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCodeSubmission = exports.getCodeSubmission = void 0;
// utils/firestore.ts
// Aquí irán las funciones para interactuar con Firestore
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Inicializa Firebase Admin SDK solo si no ha sido inicializado ya
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
async function getCodeSubmission(documentId) {
    console.log(`Utilidad Firestore: Placeholder para obtener documento ${documentId}`);
    const docRef = db.collection("code_submissions").doc(documentId);
    const doc = await docRef.get();
    if (!doc.exists) {
        console.log("Documento no encontrado en Firestore.");
        return null;
    }
    return doc.data();
}
exports.getCodeSubmission = getCodeSubmission;
async function updateCodeSubmission(documentId, data) {
    console.log(`Utilidad Firestore: Placeholder para actualizar documento ${documentId}`);
    const docRef = db.collection("code_submissions").doc(documentId);
    await docRef.update(data);
}
exports.updateCodeSubmission = updateCodeSubmission;
//# sourceMappingURL=firestore.js.map