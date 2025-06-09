# python_examples/complex_calculator.py

class ComplexCalculator:
    def __init__(self):
        self.history = []

    def add(self, x, y):
        try:
            result = x + y
            self.history.append(f"Added {x} and {y}, result: {result}")
            return result
        except: # Demasiado genérico
            self.history.append("Error in add operation.")
            print("Error: Could not perform addition.")
            return None

    def subtract(self, x, y):
        # Falta validación de tipo
        result = x - y
        self.history.append(f"Subtracted {x} and {y}, result: {result}")
        return result

    def multiply(self, x, y):
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            self.history.append("Error: Invalid types for multiplication.")
            return "Invalid input" # Mal manejo de errores: devuelve string en lugar de lanzar excepción
        return x * y

    def divide(self, x, y):
        if y == 0:
            self.history.append("Error: Division by zero attempted.")
            return "Division by zero is not allowed." # Mal manejo de errores
        return x / y

    def get_history(self, limit=None):
        if limit is None:
            return "\n".join(self.history)
        else:
            return "\n".join(self.history[-limit:])

    def reset_history(self):
        self.history = []
        return "History cleared."

# Uso de ejemplo (descomenta para probar directamente)
# if __name__ == "__main__":
#     calc = ComplexCalculator()
#     print(calc.add(10, 5))
#     print(calc.subtract(10, "5")) # Error intencional: tipo incorrecto
#     print(calc.multiply(4, 2))
#     print(calc.multiply(4, "a")) # Error intencional: tipo incorrecto
#     print(calc.divide(10, 2))
#     print(calc.divide(10, 0)) # Error intencional: división por cero
#     print(calc.get_history())
#     print(calc.reset_history())
#     print(calc.get_history())
