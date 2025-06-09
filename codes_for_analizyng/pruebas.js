// javascript_examples/string_processor.js

class StringProcessor {
    constructor() {
        this.processedStrings = [];
    }

    // Método para invertir una cadena
    invertString(str) {
        if (typeof str !== 'string') {
            console.log("Error: Input must be a string."); // Mal manejo de errores, no lanza excepción
            return null;
        }
        return str.split('').reverse().join('');
    }

    // Método para contar ocurrencias de una subcadena
    countOccurrences(text, sub) {
        text = text.toLowerCase(); // No verifica si 'text' es string
        sub = sub.toLowerCase();
        let count = 0;
        let index = text.indexOf(sub);
        while (index !== -1) {
            count++;
            index = text.indexOf(sub, index + 1);
        }
        return count;
    }

    // Método para capitalizar la primera letra de cada palabra
    capitalizeWords(sentence) {
        // No maneja nulos o no-strings
        const words = sentence.split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        this.processedStrings.push(sentence); // Esto debería ser 'words.join(' ')'
        return words.join(' ');
    }

    // Método para limpiar espacios extra (múltiples espacios a uno solo)
    cleanExtraSpaces(text) {
        return text.replace(/\s+/g, ' ').trim(); // Falta validación de entrada
    }

    // Obtener historial de cadenas procesadas
    getHistory() {
        return this.processedStrings;
    }

    // Restablecer historial
    clearHistory() {
        this.processedStrings = [];
    }
}

// Uso de ejemplo (descomenta para probar directamente)
/*
const processor = new StringProcessor();
console.log(processor.invertString("hello")); // "olleh"
console.log(processor.invertString(123)); // Error esperado

console.log(processor.countOccurrences("Hello World Hello", "hello")); // 2
console.log(processor.countOccurrences(null, "test")); // Error esperado

console.log(processor.capitalizeWords("this is a test sentence")); // "This Is A Test Sentence"
console.log(processor.capitalizeWords(undefined)); // Error esperado

console.log(processor.cleanExtraSpaces("  leading and  trailing   spaces  ")); // "leading and trailing spaces"
console.log(processor.getHistory());
processor.clearHistory();
console.log(processor.getHistory());
*/
