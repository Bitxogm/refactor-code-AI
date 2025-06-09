// utils/firestore.ts
// Aquí irán las funciones para interactuar con Firestore
import {initializeApp, getApps} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

// Inicializa Firebase Admin SDK solo si no ha sido inicializado ya
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

export async function getCodeSubmission(documentId: string): Promise<any | null> {
  console.log(`Utilidad Firestore: Placeholder para obtener documento ${documentId}`);
  const docRef = db.collection("code_submissions").doc(documentId);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.log("Documento no encontrado en Firestore.");
    return null;
  }
  return doc.data();
}

export async function updateCodeSubmission(documentId: string, data: Record<string, any>): Promise<void> {
  console.log(`Utilidad Firestore: Placeholder para actualizar documento ${documentId}`);
  const docRef = db.collection("code_submissions").doc(documentId);
  await docRef.update(data);
}