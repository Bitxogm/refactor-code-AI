// csharp_examples/RectangleCalculator.cs

using System;

public class RectangleCalculator
{
    // Método para calcular el área de un rectángulo
    public double CalculateArea(double length, double width)
    {
        // No se valida si length o width son negativos o cero.
        double area = length * width; // Variable intermedia innecesaria
        return area;
    }

    // Método para calcular el perímetro de un rectángulo
    public double CalculatePerimeter(double length, double width)
    {
        // Falta validación para asegurar que los valores sean positivos
        if (length < 0 || width < 0)
        {
            Console.WriteLine("Error: Length and width must be positive."); // Mal manejo de errores: imprime en consola en lugar de lanzar excepción
            return -1.0; // Valor mágico para indicar error
        }
        return 2 * (length + width);
    }

    // Método principal para demostrar el uso
    public static void Main(string[] args)
    {
        RectangleCalculator calculator = new RectangleCalculator();

        double rectLength = 10.0; // Nombre de variable poco descriptivo para un método estático
        double rectWidth = 5.0;

        double calculatedArea = calculator.CalculateArea(rectLength, rectWidth);
        Console.WriteLine("Area of rectangle with length " + rectLength + " and width " + rectWidth + " is: " + calculatedArea); // Concatenación de cadenas ineficiente

        double calculatedPerimeter = calculator.CalculatePerimeter(rectLength, rectWidth);
        Console.WriteLine("Perimeter of rectangle with length " + rectLength + " and width " + rectWidth + " is: " + calculatedPerimeter);

        // Prueba con valores inválidos
        double invalidLength = -3.0;
        double invalidWidth = 4.0;
        double invalidPerimeter = calculator.CalculatePerimeter(invalidLength, invalidWidth); // El error se imprime, pero el método devuelve -1.0
        Console.WriteLine("Perimeter of rectangle with length " + invalidLength + " and width " + invalidWidth + " is: " + invalidPerimeter);
    }
}
