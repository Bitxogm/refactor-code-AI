// typescript_examples/number_processor.ts

class NumberProcessor {
    private numbers: number[]; // Array para almacenar números procesados

    constructor() {
        this.numbers = [];
    }

    // Método para sumar todos los números en un array
    // Este método usa un bucle for tradicional, que podría ser más conciso.
    calculateSum(inputNumbers: number[]): number {
        let total = 0;
        for (let i = 0; i < inputNumbers.length; i++) {
            total += inputNumbers[i];
        }
        return total;
    }

    // Método para filtrar números pares
    // No maneja entradas no-array o arrays con tipos mixtos explícitamente.
    filterEvenNumbers(inputNumbers: number[]): number[] {
        const evenNumbers: number[] = [];
        for (const num of inputNumbers) {
            if (num % 2 === 0) {
                evenNumbers.push(num);
            }
        }
        return evenNumbers;
    }

    // Método para agregar un número al historial
    // No valida si el input es realmente un número.
    addNumberToHistory(num: any): void { // 'any' permite cualquier tipo, lo que es un riesgo
        this.numbers.push(num);
        console.log(`Added ${num} to history.`); // Uso directo de console.log
    }

    // Obtener historial de números
    getHistory(): number[] {
        return [...this.numbers]; // Devuelve una copia para evitar modificación externa directa
    }

    // Limpiar historial
    clearHistory(): void {
        this.numbers = [];
        console.log("History cleared.");
    }
}

// Uso de ejemplo (descomenta para probar directamente)
/*
const processor = new NumberProcessor();
console.log("Sum:", processor.calculateSum([1, 2, 3, 4, 5])); // 15
console.log("Even Numbers:", processor.filterEvenNumbers([1, 2, 3, 4, 5, 6])); // [2, 4, 6]

processor.addNumberToHistory(10);
processor.addNumberToHistory("abc"); // Error intencional: añadir un string
processor.addNumberToHistory(25);
console.log("History:", processor.getHistory()); // [10, "abc", 25]

processor.clearHistory();
console.log("History after clear:", processor.getHistory()); // []
*/
