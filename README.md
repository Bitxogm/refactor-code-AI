Code AI Agent (Otaku&Obama_2025)
English Version
Project Overview
The Code AI Agent is an innovative web application designed to assist developers by leveraging Artificial Intelligence for advanced code analysis and refactoring. Developed with a modern web stack, it provides capabilities such as code refactoring, unit test generation, security analysis, and flow diagram descriptions across multiple programming languages.

This project was built following best practices in web development and cloud integration, focusing on real-time responsiveness and a user-friendly interface.

Key Features
Intelligent Code Refactoring: Submit code in various languages (Python, JavaScript, Java, C#, Go, TypeScript) and receive refactored, optimized, and cleaner versions.

Multi-Language Support: Capable of processing and understanding code in several popular programming languages.

Unit Test Generation: Automatically generates relevant unit tests for the provided code snippet, ensuring functionality and robustness.

Security Analysis: Performs a basic analysis of the code for potential security vulnerabilities and suggests improvements.

Flowchart Description: Provides a natural language description of the code's logical flow, aiding in comprehension.

Inline Code Comments: Inserts context-aware comments directly into the refactored code for better understanding of changes and suggestions.

Real-time Updates: Utilizes Firebase Firestore for real-time communication between the frontend and backend, providing instant results.

User Authentication: Implements anonymous user authentication with Firebase Auth to manage individual code submissions securely.

File Upload: Allows users to upload code files directly for analysis.

Copy to Clipboard: One-click copy functionality for refactored code and other outputs.

Technologies Used
Frontend:

HTML5: Structure of the web application.

Tailwind CSS: Utility-first CSS framework for rapid and responsive UI development.

JavaScript (Vanilla JS): Core interactivity and logic.

CodeMirror: In-browser code editor for a professional coding experience.

Backend:

Firebase Functions (Node.js/TypeScript): Serverless backend for handling AI requests and integrating with Google Gemini.

Firebase Firestore: NoSQL cloud database for storing code submissions, managing task statuses, and real-time data synchronization.

Artificial Intelligence:

Google Gemini API (gemini-1.5-flash): Powers the intelligent analysis, refactoring, and content generation for various modes.

How it Works
The application operates on a robust, real-time, event-driven architecture:

User Input: The user pastes or uploads code into the CodeMirror input editor and selects the input language and desired analysis mode (refactor, test, security).

Frontend Submission: Upon clicking "Execute Agent", the JavaScript frontend securely saves the code and selected parameters as a new document in a private Firestore collection (artifacts/{appId}/users/{userId}/code_submissions).

Backend Trigger: A Firebase Cloud Function (written in Node.js/TypeScript) is automatically triggered by the creation of this new Firestore document.

AI Processing: The Cloud Function extracts the code, constructs a specific prompt for the Google Gemini API based on the selected analysis mode, and sends the request.

Result Update: Gemini processes the prompt and returns the generated content (refactored code, unit tests, security analysis, flowchart description, inline comments).

Firestore Update: The Cloud Function updates the original Firestore document with the results from Gemini and changes its status to "completed" or "error".

Real-time Display: The frontend, which has been listening for changes on that specific Firestore document via onSnapshot, receives the updated data in real-time and displays the results in the CodeMirror output editor and other dedicated sections.

Setup and Installation
To set up this project locally and deploy it, follow these general steps:

Firebase Project: Create a new Firebase project in the Firebase Console.

Firestore: Initialize Firestore in your project.

Firebase Functions: Set up your Firebase Functions environment.

Google Gemini API Key: Enable the Google Gemini API and obtain an API key. Configure it as an environment variable for your Firebase Functions:

firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"

Clone Repository: Clone this project's repository.

Frontend Dependencies: Navigate to the frontend directory (your-project-root/) and install dependencies:

npm install

Functions Dependencies: Navigate to the functions directory (your-project-root/functions) and install dependencies:

npm install

Deploy Functions: From the functions directory, deploy your Firebase Functions:

firebase deploy --only functions

Deploy Frontend: Deploy your static frontend files (HTML, CSS, JS) to Firebase Hosting:

firebase deploy --only hosting

Usage
Open the deployed web application in your browser.

Select the desired "Analysis Mode" (Refactoring, Unit Tests, Security Analysis).

Choose the "Input Language" of your code.

(Optional) Select a "Output Language" if you want to transpile the code (e.g., Python to JavaScript).

Paste your code into the "Original Code" editor or upload a file.

Click the "Execute Agent" button.

View the generated results in the respective output sections.

Versión en Español
Agente de IA de Código (Otaku&Obama_2025)
Descripción General del Proyecto
El Agente de IA de Código es una innovadora aplicación web diseñada para asistir a los desarrolladores, aprovechando la Inteligencia Artificial para el análisis y la refactorización avanzada de código. Desarrollado con un stack web moderno, ofrece capacidades como la refactorización de código, generación de pruebas unitarias, análisis de seguridad y descripciones de diagramas de flujo en múltiples lenguajes de programación.

Este proyecto ha sido construido siguiendo las mejores prácticas en desarrollo web e integración en la nube, centrándose en la reactividad en tiempo real y una interfaz de usuario amigable.

Funcionalidades Clave
Refactorización Inteligente de Código: Envía código en varios lenguajes (Python, JavaScript, Java, C#, Go, TypeScript) y recibe versiones refactorizadas, optimizadas y más limpias.

Soporte Multi-Lenguaje: Capaz de procesar y comprender código en varios lenguajes de programación populares.

Generación de Pruebas Unitarias: Genera automáticamente pruebas unitarias relevantes para el fragmento de código proporcionado, asegurando la funcionalidad y la robustez.

Análisis de Seguridad: Realiza un análisis básico del código en busca de posibles vulnerabilidades de seguridad y sugiere mejoras.

Descripción de Diagrama de Flujo: Proporciona una descripción en lenguaje natural del flujo lógico del código, ayudando a su comprensión.

Comentarios en Línea en el Código: Inserta comentarios conscientes del contexto directamente en el código refactorizado para una mejor comprensión de los cambios y sugerencias.

Actualizaciones en Tiempo Real: Utiliza Firebase Firestore para la comunicación en tiempo real entre el frontend y el backend, proporcionando resultados instantáneos.

Autenticación de Usuario: Implementa autenticación anónima de usuario con Firebase Auth para gestionar las entregas de código individuales de forma segura.

Carga de Archivos: Permite a los usuarios cargar archivos de código directamente para su análisis.

Copiar al Portapapeles: Funcionalidad de copiar con un solo clic para el código refactorizado y otras salidas.

Tecnologías Utilizadas
Frontend:

HTML5: Estructura de la aplicación web.

Tailwind CSS: Framework CSS utility-first para un desarrollo rápido y responsivo de la interfaz de usuario.

JavaScript (Vanilla JS): Interactividad y lógica principal.

CodeMirror: Editor de código en el navegador para una experiencia de codificación profesional.

Backend:

Firebase Functions (Node.js/TypeScript): Backend sin servidor para manejar las solicitudes de IA e integrarse con Google Gemini.

Firebase Firestore: Base de datos en la nube NoSQL para almacenar las entregas de código, gestionar los estados de las tareas y la sincronización de datos en tiempo real.

Inteligencia Artificial:

Google Gemini API (gemini-1.5-flash): Impulsa el análisis inteligente, la refactorización y la generación de contenido para los diversos modos.

Cómo Funciona
La aplicación opera sobre una arquitectura robusta, en tiempo real y orientada a eventos:

Entrada del Usuario: El usuario pega o carga código en el editor de entrada de CodeMirror y selecciona el lenguaje de entrada y el modo de análisis deseado (refactorizar, probar, seguridad).

Envío del Frontend: Al hacer clic en "Execute Agent", el frontend JavaScript guarda de forma segura el código y los parámetros seleccionados como un nuevo documento en una colección privada de Firestore (artifacts/{appId}/users/{userId}/code_submissions).

Disparador del Backend: Una función de Firebase Cloud Function (escrita en Node.js/TypeScript) se activa automáticamente por la creación de este nuevo documento de Firestore.

Procesamiento de IA: La Cloud Function extrae el código, construye un prompt específico para la API de Google Gemini basándose en el modo de análisis seleccionado y envía la solicitud.

Actualización de Resultados: Gemini procesa el prompt y devuelve el contenido generado (código refactorizado, pruebas unitarias, análisis de seguridad, descripción del diagrama de flujo, comentarios en línea).

Actualización de Firestore: La Cloud Function actualiza el documento original en Firestore con los resultados de Gemini y cambia su estado a "completed" (completado) o "error".

Visualización en Tiempo Real: El frontend, que ha estado escuchando los cambios en ese documento específico de Firestore a través de onSnapshot, recibe los datos actualizados en tiempo real y muestra los resultados en el editor de salida de CodeMirror y otras secciones dedicadas.

Configuración e Instalación
Para configurar este proyecto localmente y desplegarlo, sigue estos pasos generales:

Proyecto de Firebase: Crea un nuevo proyecto de Firebase en la Consola de Firebase.

Firestore: Inicializa Firestore en tu proyecto.

Firebase Functions: Configura tu entorno de Firebase Functions.

Clave API de Google Gemini: Habilita la API de Google Gemini y obtén una clave API. Configúrala como una variable de entorno para tus Firebase Functions:

firebase functions:config:set gemini.api_key="TU_CLAVE_API_GEMINI"

Clonar Repositorio: Clona el repositorio de este proyecto.

Dependencias del Frontend: Navega al directorio del frontend (la-raiz-de-tu-proyecto/) e instala las dependencias:

npm install

Dependencias de las Funciones: Navega al directorio de las funciones (la-raiz-de-tu-proyecto/functions) e instala las dependencias:

npm install

Desplegar Funciones: Desde el directorio functions, despliega tus Firebase Functions:

firebase deploy --only functions

Desplegar Frontend: Despliega tus archivos estáticos del frontend (HTML, CSS, JS) en Firebase Hosting:

firebase deploy --only hosting

Uso
Abre la aplicación web desplegada en tu navegador.

Selecciona el "Modo de Análisis" deseado (Refactorización, Pruebas Unitarias, Análisis de Seguridad).

Elige el "Lenguaje de entrada" de tu código.

(Opcional) Selecciona un "Lenguaje de salida" si deseas transpilación de código (por ejemplo, de Python a JavaScript).

Pega tu código en el editor de "Código Original" o carga un archivo.

Haz clic en el botón "Execute Agent".

Visualiza los resultados generados en las secciones de salida correspondientes.