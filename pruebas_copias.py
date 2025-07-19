import math

class RectangleCalculator:
    """Clase para calcular el área y perímetro de un rectángulo."""

    def calculate_area(self, length: float, width: float) -> float:
        # Se valida que las dimensiones sean positivas
        self._validate_dimensions(length, width)
        return length * width

    def calculate_perimeter(self, length: float, width: float) -> float:
        # Se valida que las dimensiones sean positivas
        self._validate_dimensions(length, width)
        return 2 * (length + width)

    def _validate_dimensions(self, length: float, width: float) -> None:
        # Se lanza una excepción si las dimensiones no son válidas
        if length <= 0 or width <= 0:
            raise ValueError("Length and width must be positive values.")



def main():
    calculator = RectangleCalculator()
    rect_length = 10.0
    rect_width = 5.0
    try:
        calculated_area = calculator.calculate_area(rect_length, rect_width)
        print(f"Area of rectangle with length {rect_length} and width {rect_width} is: {calculated_area}")

        calculated_perimeter = calculator.calculate_perimeter(rect_length, rect_width)
        print(f"Perimeter of rectangle with length {rect_length} and width {rect_width} is: {calculated_perimeter}")

        # Prueba con valores inválidos
        invalid_length = -3.0
        invalid_width = 4.0
        calculated_perimeter = calculator.calculate_perimeter(invalid_length, invalid_width)
        print(f"Perimeter of rectangle with length {invalid_length} and width {invalid_width} is: {calculated_perimeter}")
    except ValueError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()

# Mejoras generales:
# - Se cambió el nombre de las funciones a snake_case (PEP 8).
# - Se añadieron anotaciones de tipo para mejorar la legibilidad y la detección de errores.
# - Se cambió el manejo de errores usando excepciones en lugar de imprimir mensajes en la consola.
# - Se eliminó el uso de variables intermedias innecesarias.
# - Se mejoró la legibilidad del código usando f-strings.
# - Se agregó una función privada para validar las dimensiones.
# - Se mejoró la modularidad del código separando la lógica de cálculo de la lógica de la interfaz de usuario.
# - Se mejoró la gestión de errores utilizando excepciones para un mejor manejo de los errores.