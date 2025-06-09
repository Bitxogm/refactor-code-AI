 
package com.mycompany.app;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Scanner; // Added for main method input simulation

// Simple Product class - lacks proper encapsulation and equals/hashCode
class Product {
    public String productId;
    public String name;
    public double price;
    public int stockQuantity;

    public Product(String id, String n, double p, int sq) {
        this.productId = id;
        this.name = n;
        this.price = p;
        this.stockQuantity = sq;
    }

    public void displayProductInfo() {
        System.out.println("Product ID: " + productId + ", Name: " + name + ", Price: " + price + ", Stock: " + stockQuantity);
    }
}

// Order class - lacks proper encapsulation
class Order {
    public String orderId;
    public Date orderDate;
    public List<Product> items; // List of products in the order
    public double totalAmount;
    public String customerName; // Direct access to customer info

    public Order(String id, String custName) {
        this.orderId = id;
        this.orderDate = new Date();
        this.items = new ArrayList<>();
        this.totalAmount = 0.0;
        this.customerName = custName;
    }

    public void addProductToOrder(Product p, int quantity) {
        // Simple logic, doesn't handle negative quantity or stock check properly
        for (int i = 0; i < quantity; i++) {
            items.add(p);
            totalAmount += p.price;
            p.stockQuantity--; // Directly modifying product stock from here
        }
    }

    public void processOrder() {
        System.out.println("Processing order: " + orderId + " for " + customerName);
        if (items.isEmpty()) {
            System.out.println("Order " + orderId + " has no items.");
            return;
        }
        // Basic check for items
        System.out.println("Items in order:");
        for (Product item : items) {
            System.out.println(" - " + item.name + " ($" + item.price + ")");
        }
        System.out.println("Total: $" + totalAmount);
        System.out.println("Order processed on: " + orderDate);

        // Simulate saving to a database - potential issue here
        String sql = "INSERT INTO orders (id, customer, total) VALUES ('" + orderId + "', '" + customerName + "', " + totalAmount + ");";
        System.out.println("Simulated SQL Query: " + sql);
    }
}

// Main class to demonstrate - contains common bad practices
public class SimpleOrderProcessor {

    public static void main(String[] args) {
        System.out.println("--- Starting Simple Order Processor ---");

        // Creating some products
        Product tv = new Product("P001", "Smart TV", 750.00, 10);
        Product laptop = new Product("P002", "Gaming Laptop", 1200.00, 5);
        Product mouse = new Product("P003", "Wireless Mouse", 25.00, 50);

        // Display product info directly accessing public members
        System.out.println("\nInitial Product Stocks:");
        tv.displayProductInfo();
        laptop.displayProductInfo();
        mouse.displayProductInfo();

        // Creating an order
        Order customerOrder = new Order("ORD001", "Juan Perez");

        // Adding products to order
        customerOrder.addProductToOrder(tv, 1);
        customerOrder.addProductToOrder(laptop, 1);
        customerOrder.addProductToOrder(mouse, 3);

        System.out.println("\nAfter adding items to order:");
        tv.displayProductInfo(); // Stock should have changed
        laptop.displayProductInfo();
        mouse.displayProductInfo();


        // Process the order
        customerOrder.processOrder();


        // Demonstrating potential NullPointerException
        String nullString = null;
        try {
            System.out.println("\nTrying to use a null string length: " + nullString.length()); // Will throw NullPointerException
        } catch (Exception e) { // Catching generic Exception
            System.err.println("Caught a general error: " + e.getMessage());
        }

        // Simulating a "vulnerable" input (for security analysis)
        Scanner scanner = new Scanner(System.in);
        System.out.print("\nEnter a customer name for a new order (e.g., 'Maria' or 'Robert' OR ' OR 1=1-- ' for SQL injection test): ");
        String userInput = scanner.nextLine(); // User input that could be malicious

        Order vulnerableOrder = new Order("ORD002", userInput);
        vulnerableOrder.addProductToOrder(mouse, 1); // Add one item to make it a valid order
        vulnerableOrder.processOrder(); // This will print the "vulnerable" SQL

        scanner.close(); // Close the scanner

        System.out.println("\n--- Simple Order Processor Ended ---");
    }
}
