"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCodeForAnalysis = exports.testModularImports = void 0;
const functions = __importStar(require("firebase-functions"));
// Importaciones de Firebase Admin
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const json5_1 = __importDefault(require("json5"));
// Inicializar Firebase Admin
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
// Importaciones de tus servicios y utilidades
const geminiService_1 = require("./services/geminiService");
const codeAnalyzer_1 = require("./core/codeAnalyzer"); // Mantener si se usa en otras partes, si no, puedes eliminarla
const firestore_2 = require("./utils/firestore"); // Mantener si se usa en otras partes, si no, puedes eliminarla
// Función placeholder que usa los módulos para probar la compilación
exports.testModularImports = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Probando importaciones modulares...", { structuredData: true });
    // Llamadas de prueba para satisfacer a TypeScript y verificar la compilación
    const geminiResult = await (0, geminiService_1.getGeminiAnalysis)("some code", "javascript", "javascript", "refactor");
    const analyzed = await (0, codeAnalyzer_1.analyzeCode)("more code", "javascript"); // Si no necesitas analyzeCode, puedes eliminar esta línea y su importación
    const testDoc = await (0, firestore_2.getCodeSubmission)("test-document-id-placeholder"); // Si no necesitas getCodeSubmission, puedes eliminar esta línea y su importación
    await (0, firestore_2.updateCodeSubmission)("test-doc-id", { status: "modularTest" }); // Si no necesitas updateCodeSubmission, puedes eliminar esta línea y su importación
    response.send(`Modular imports test completed. Gemini: ${geminiResult}, Analyzed: ${JSON.stringify(analyzed)}, Firestore Doc: ${testDoc ? "found" : "not found"}`);
});
// --- FUNCIÓN PARA PROCESAR CÓDIGO AL CREARSE EN FIRESTORE ---
exports.submitCodeForAnalysis = functions.firestore
    .onDocumentCreated("code_submissions/{documentId}", async (event) => {
    const snap = event.data;
    if (!snap) {
        console.log("No data associated with the event");
        return;
    }
    // Accede a los datos del documento recién creado
    const data = snap.data();
    const code = data.originalCode;
    // ✅ Usamos los campos nuevos
    const inputLanguage = data.inputLanguage || "javascript";
    const outputLanguage = data.outputLanguage || inputLanguage;
    const analysisMode = data.analysisMode || "refactor"; // Aseguramos que el modo sea 'refactor' por defecto
    const documentId = event.params.documentId;
    functions.logger.info(`Nueva entrada de código detectada en Firestore con ID: ${documentId}`, {
        codeLength: code ? code.length : 0,
        inputLanguage,
        outputLanguage,
        analysisMode, // Incluimos analysisMode en el log
    });
    // Valida que haya código
    if (!code) {
        functions.logger.error(`Documento ID ${documentId}: El campo 'originalCode' está ausente o vacío.`);
        await snap.ref.update({
            status: "error",
            errorMessage: "El campo 'originalCode' es obligatorio y no fue encontrado.",
            analysisTimestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        return null;
    }
    try {
        // ✅ Llamamos al servicio con ambos lenguajes
        const geminiResultText = await (0, geminiService_1.getGeminiAnalysis)(code, inputLanguage, outputLanguage, analysisMode);
        functions.logger.info(`Resultado RAW de Gemini para ID ${documentId} (primeros 200 chars): ${geminiResultText.substring(0, Math.min(geminiResultText.length, 200))}...`);
        // --- NUEVO CÓDIGO PARA LIMPIAR LA RESPUESTA DE GEMINI ---
        let cleanedGeminiResponseText = geminiResultText.trim(); // Elimina espacios en blanco al inicio/final
        // Expresión regular para encontrar y eliminar el bloque de código Markdown (```json...```)
        // El patrón ^```json\n([\s\S]*)\n```$ busca el inicio de la cadena, ```json, un salto de línea,
        // luego captura todo ([\s\S]*) hasta un salto de línea, ```, y el final de la cadena.
        const jsonBlockMatch = cleanedGeminiResponseText.match(/^```json\n([\s\S]*)\n```$/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
            cleanedGeminiResponseText = jsonBlockMatch[1].trim(); // Si encuentra el bloque, usa solo el contenido dentro
            functions.logger.info("DEBUG: Bloque JSON extraído exitosamente.");
        }
        else {
            functions.logger.warn(`WARNING: No se encontró bloque JSON Markdown en la respuesta de Gemini para ${documentId}. Se intentará parsear la respuesta cruda.`);
            // Si no se encuentra el bloque ```json, intentamos parsear la respuesta tal cual.
            // Esto es un respaldo, pero si Gemini sigue añadiendo ```, el error persistirá sin el bloque.
        }
        // --- FIN DEL NUEVO CÓDIGO ---
        let responseData;
        try {
            // Intentamos parsear la respuesta de Gemini como JSON
            // AHORA USAMOS cleanedGeminiResponseText
            responseData = json5_1.default.parse(cleanedGeminiResponseText);
        }
        catch (e) {
            // Si hay un error al parsear el JSON, registramos el error y actualizamos el estado en Firestore
            const parseErrorMessage = e instanceof Error ? e.message : "Error desconocido al parsear JSON";
            functions.logger.error(`Error al parsear la respuesta JSON de Gemini para ${documentId}: ${parseErrorMessage}`, {
                rawGeminiResponse: geminiResultText, // Guardamos la respuesta cruda para depuración
            });
            await snap.ref.update({
                status: "error",
                errorMessage: `Error al parsear la respuesta JSON de Gemini: ${parseErrorMessage}`,
                rawGeminiResponse: geminiResultText,
                analysisTimestamp: firestore_1.FieldValue.serverTimestamp(),
            });
            return null; // Salimos de la función si el JSON no es válido
        }
        // Si el parseo es exitoso, actualizamos el documento en Firestore con los campos separados
        await snap.ref.update({
            refactoredCode: responseData.refactoredCode || "",
            refactoringSummary: responseData.refactoringSummary || "",
            inlineComments: responseData.inlineComments || [],
            unitTests: responseData.unitTests || "",
            securityAnalysis: responseData.securityAnalysis || "",
            flowchartDescription: responseData.flowchartDescription || "",
            architecturalSuggestions: responseData.architecturalSuggestions || "",
            status: "completed",
            analysisTimestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Documento ID ${documentId} actualizado con éxito con los resultados JSON.`);
        return null;
    }
    catch (error) { // Este es el catch del try principal que maneja errores de getGeminiAnalysis o de red.
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        functions.logger.error(`Error al procesar el documento ${documentId}:`, error);
        // Actualiza el documento con el estado de error
        await snap.ref.update({
            status: "error",
            errorMessage: `Fallo en la refactorización: ${errorMessage}`,
            analysisTimestamp: firestore_1.FieldValue.serverTimestamp(),
        });
        return null;
    }
});
//# sourceMappingURL=index.js.map