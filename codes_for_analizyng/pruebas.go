// go_examples/fibonacci_calculator.go

package main

import (
	"fmt"
	"strconv" // Para la conversión de string a int
)

// Calcula el enésimo número de Fibonacci de forma recursiva
// Esta implementación es ineficiente para números grandes.
func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

// Genera una secuencia de Fibonacci hasta el enésimo número
func generateFibonacciSequence(limit int) []int {
	if limit < 0 {
		fmt.Println("Error: Limit cannot be negative.") // Mal manejo de errores, imprime en consola
		return nil // Devuelve nil en caso de error
	}

	sequence := []int{} // Creación de slice sin pre-asignación de capacidad
	for i := 0; i <= limit; i++ {
		sequence = append(sequence, fibonacci(i))
	}
	return sequence
}

func main() {
	// Lectura de entrada simple, sin manejo robusto de errores de conversión
	var input string
	fmt.Print("Enter a non-negative integer for Fibonacci sequence: ")
	fmt.Scanln(&input)

	num, err := strconv.Atoi(input)
	if err != nil {
		fmt.Println("Invalid input. Please enter a valid number.")
		return
	}

	// Comprobación de números negativos
	if num < 0 {
		fmt.Println("Number must be non-negative.")
		return
	}

	result := generateFibonacciSequence(num)
	fmt.Printf("Fibonacci sequence up to %d: %v\n", num, result)
}
