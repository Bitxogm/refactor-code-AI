
import {GoogleGenerativeAI} from "@google/generative-ai";
import {defineString} from "firebase-functions/params";
import * as functions from "firebase-functions"; // Necesario para functions.logger.info

// Definir la variable de configuración
const geminiApiKey = defineString("GEMINI_API_KEY");
export async function getGeminiAnalysis(
  code: string,
  inputLanguage: string,
  outputLanguage: string,
  analysisMode: string
): Promise<string> {
  const API_KEY = geminiApiKey.value();

  if (!API_KEY) {
    functions.logger.error("Error: GEMINI_API_KEY no está configurada como variable de entorno.");
    throw new Error("API Key para Gemini no configurada.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

  let instruction = "";

  if (analysisMode === "test") {
    instruction = `
Eres un Full Stack Developer con amplia experiencia en Testing.
Analiza cuidadosamente el siguiente código en \`${inputLanguage}\`.
Genera pruebas unitarias ejecutables en \`${outputLanguage}\`.

Requisitos:
- Usa el framework más común en \`${outputLanguage}\` (ej: Jest para JS, JUnit para Java).
- Incluye pruebas para casos normales, límites y errores.
- Devuelve SOLO el código — sin texto introductorio ni explicaciones extra.
- No uses bloques markdown (\`\`\`java...\`\`\`).
- Añade comentarios en el código explicando qué prueba se realiza y por qué es importante.
`;
  } else if (analysisMode === "security") {
    instruction = `
Eres un experto Code Security Analyst.
Tu enfoque es analizar código fuente en múltiples lenguajes para detectar vulnerabilidades comunes (XSS, SQLi, CSRF, RCE, etc.).
Dominio profundo de OWASP Top 10 y estándares CWE, CVE, NIST.
Analiza el siguiente código escrito en \`${inputLanguage}\`.

Requisitos:
- Si detectas vulnerabilidades, corrige directamente el código e incluye comentarios específicos que expliquen cada riesgo y cómo la corrección lo mitiga.
- Si no hay problemas, indica claramente qué partes son seguras, con comentarios en el código.
- Devuelve SOLO el código corregido o revisado — sin texto introductorio.
- No uses bloques markdown.
`;
  } else {
    instruction = `
Refactoriza este código escrito en \`${inputLanguage}\` y devuélvelo en \`${outputLanguage}\`.

Mejoras esperadas:
- Código más legible, mantenible y escalable.
- Uso de buenas prácticas propias de \`${outputLanguage}\`.
- Modularidad mejorada si corresponde.
- Añade comentarios **dentro del código** que expliquen:
  - Qué cambios o validaciones se hicieron.
  - Por qué se hicieron esos cambios (beneficios y problemas que resuelven).
  - Puntos clave para entender la estructura o lógica importante.

Requisitos:
- Devuelve SOLO el código refactorizado — sin texto introductorio ni bloques markdown.
- Los comentarios deben ser claros, breves y educativos.
- Al final del código, añade un bloque de comentarios separados con una explicación resumida de las mejoras generales realizadas.
`;
  }

  const fullPrompt = `Eres un ingeniero de software experto en múltiples lenguajes de programación, refactorización, desarrollo de pruebas unitarias y análisis de seguridad.
Tu tarea es procesar el código proporcionado por el usuario y devolver una respuesta estructurada **EXCLUSIVAMENTE en formato JSON**.

El JSON debe contener los siguientes campos obligatorios, cada uno como una cadena de texto (excepto \`inlineComments\` que es un array de objetos):

1.  \`refactoredCode\` (string):
    * Contendrá el código ${inputLanguage} refactorizado, con comentarios claros **dentro del código** explicando cada cambio y mejora realizada (ej. qué cambios, por qué se hicieron, puntos clave de lógica).
    * La refactorización debe buscar mejorar la legibilidad, la eficiencia, la modularidad y la adherencia a las mejores prácticas de ${inputLanguage} (ej: PEP 8 para Python).
    * Este campo siempre contendrá el código principal refactorizado, incluso si no se selecciona específicamente el modo de refactorización, ya que es la base para otros análisis.

2.  \`refactoringSummary\` (string):
    * Contendrá un resumen conciso en texto plano (puedes usar Markdown para formato si es útil, pero sin código) de las **mejoras generales** realizadas en la refactorización del código.
    * Si el modo seleccionado es 'test' o 'security' y no se aplica una refactorización significativa más allá de la base, este campo puede indicar 'No se requirieron cambios de refactorización significativos para este análisis.'

3.  \`inlineComments\` (Array<Object>):
    * Contendrá una lista de objetos JSON, donde cada objeto representa un comentario o sugerencia asociado a una línea específica del código refactorizado.
    * Formato de cada objeto: \`{"lineNumber": <número de línea>, "text": "<descripción del comentario>", "type": "<info|warning|error>"}\`
        * \`lineNumber\` (number): El número de línea (base 1) en el \`refactoredCode\` al que se refiere el comentario.
        * \`text\` (string): El texto del comentario o sugerencia.
        * \`type\` (string, opcional): Indica la naturaleza del comentario (por ejemplo, 'info' para información general, 'warning' para posibles problemas, 'error' para errores o problemas graves). Si no hay un tipo específico, usa 'info'.
    * Genera estos comentarios para explicar cambios específicos, mejoras, optimizaciones, o puntos de atención directamente relacionados con las líneas de código afectadas en \`refactoredCode\`.
    * Si no hay comentarios específicos para líneas (ej. refactorización muy simple o solo análisis general), este campo debe ser una array vacía \`[]\`.

4.  \`unitTests\` (string):
    * Si el \`analysisMode\` es 'test', este campo contendrá el código ${outputLanguage} completo de **pruebas unitarias exhaustivas** para todas las clases y métodos relevantes del código proporcionado.
    * Las pruebas deben usar el framework más común en ${outputLanguage} (ej: \`unittest\` para Python, Jest para JS).
    * Deben incluir pruebas para casos normales, límites y errores.
    * Los comentarios deben estar **dentro del código de las pruebas** explicando qué prueba se realiza y por qué es importante.
    * **IMPORTANTE**: NO incluyas el código original de las clases principales dentro de este campo, solo el código de las pruebas unitarias.
    * Si el \`analysisMode\` NO es 'test', este campo debe ser una cadena vacía \`""\` o una cadena con un mensaje como 'Este modo no genera pruebas unitarias.'.

5.  \`securityAnalysis\` (string):
    * Si el \`analysisMode\` es 'security', este campo contendrá un informe detallado en texto plano (Markdown opcional para formato, pero sin bloques de código) del **análisis de seguridad** del código.
    * Identificará posibles vulnerabilidades comunes (ej. inyección, manejo de datos sensibles, validación de entrada deficiente, XSS, SQLi, CSRF, RCE, etc.), riesgos y sugerencias de mitigación.
    * Dominio profundo de OWASP Top 10 y estándares CWE, CVE, NIST.
    * **IMPORTANTE**: NO incluyas el código original ni ninguna refactorización del código dentro de este campo, solo el informe de análisis de seguridad.
    * Si el \`analysisMode\` NO es 'security', este campo debe ser una cadena vacía \`""\` o una cadena con un mensaje como 'Este modo no realiza un análisis de seguridad.'.

6.  \`flowchartDescription\` (string):
    * Contendrá una descripción detallada en texto plano (Markdown opcional) de cómo se podría representar la lógica principal del programa en un diagrama de flujo, describiendo los pasos clave y las decisiones. Esto es útil para la comprensión gráfica del código.
    * Este campo siempre debe generarse, independientemente del modo.

7.  \`architecturalSuggestions\` (string):
    * **Si el código de entrada es extenso (más de 100 líneas o con múltiples responsabilidades), proporciona sugerencias de modularización y una simulación de estructura de directorios y archivos usando ES Modules (import/export) u otro sistema de módulos apropiado para el lenguaje.**
    * **Incluye ejemplos de cómo se verían los \`import\` y \`export\` entre los archivos clave.**
    * **Si el código no es extenso o no hay sugerencias de arquitectura, este campo debe ser una cadena vacía \`""\`.**

**Reglas Generales de la Respuesta JSON:**
-   **Todos los valores de cadena (string) dentro del JSON DEBEN tener los caracteres especiales correctamente escapados (ej. comillas dobles con \\", barras invertidas con \\\\, saltos de línea con \\n).**
-   La respuesta debe ser **EXCLUSIVAMENTE el objeto JSON**, sin ningún texto adicional, preámbulo o post-ámbulo.
-   El JSON debe ser **válido** y estar bien formateado.
-   **Todos los campos listados arriba (refactoredCode, refactoringSummary, inlineComments, unitTests, securityAnalysis, flowchartDescription, architecturalSuggestions) deben estar presentes en el JSON final.**
-   Cada campo del JSON debe contener el texto solicitado, o una cadena vacía \`""\` si no aplica para el modo actual o si no hay contenido, o un array vacío \`[]\` para \`inlineComments\` si no hay comentarios.

---

### **Instrucciones Adicionales Específicas para el Modo (\`${analysisMode}\`):**
${instruction}

### **Configuración del Lenguaje:**
-   El \`inputLanguage\` es: ${inputLanguage}.
-   El \`outputLanguage\` deseado es: ${outputLanguage}.

### **Código a Procesar:**

\`\`\`${inputLanguage}
${code}
\`\`\`

### **Formato de Respuesta Requerido (JSON):**
\`\`\`json
{
"refactoredCode": "",
"refactoringSummary": "",
"inlineComments": [],
"unitTests": "",
"securityAnalysis": "",
"flowchartDescription": "",
"architecturalSuggestions": ""
}
\`\`\`
Por favor, rellena el JSON de arriba basándote en las instrucciones y el código proporcionado.
`;

  // ... (Tu código actual de geminiService.ts, incluyendo la definición y lógica de 'instruction') ...


  //   const fullPrompt = `
  // Eres un ingeniero de software experto en múltiples lenguajes de programación, refactorización, desarrollo de pruebas unitarias y análisis de seguridad.
  // Tu tarea es procesar el código proporcionado por el usuario y devolver una respuesta estructurada **EXCLUSIVAMENTE en formato JSON**.

  // El JSON debe contener los siguientes campos obligatorios, cada uno como una cadena de texto:

  // 1.  \`refactoredCode\` (string):
  //     * Contendrá el código ${inputLanguage} refactorizado, con comentarios claros **dentro del código** explicando cada cambio y mejora realizada (ej. qué cambios, por qué se hicieron, puntos clave de lógica).
  //     * La refactorización debe buscar mejorar la legibilidad, la eficiencia, la modularidad y la adherencia a las mejores prácticas de ${inputLanguage} (ej: PEP 8 para Python).
  //     * Este campo siempre contendrá el código principal refactorizado, incluso si no se selecciona específicamente el modo de refactorización, ya que es la base para otros análisis.

  // 2.  \`refactoringSummary\` (string):
  //     * Contendrá un resumen conciso en texto plano (puedes usar Markdown para formato si es útil, pero sin código) de las **mejoras generales** realizadas en la refactorización del código.
  //     * Si el modo seleccionado es 'test' o 'security' y no se aplica una refactorización significativa más allá de la base, este campo puede indicar 'No se requirieron cambios de refactorización significativos para este análisis.'

  // 3.  \`inlineComments\` (Array<Object>):
  //     * Contendrá una lista de objetos JSON, donde cada objeto representa un comentario o sugerencia asociado a una línea específica del código refactorizado.
  //     * Formato de cada objeto: \`{"lineNumber": <número de línea>, "text": "<descripción del comentario>", "type": "<info|warning|error>"}\`
  //         * \`lineNumber\` (number): El número de línea (base 1) en el \`refactoredCode\` al que se refiere el comentario.
  //         * \`text\` (string): El texto del comentario o sugerencia.
  //         * \`type\` (string, opcional): Indica la naturaleza del comentario (por ejemplo, 'info' para información general, 'warning' para posibles problemas, 'error' para errores o problemas graves). Si no hay un tipo específico, usa 'info'.
  //     * Genera estos comentarios para explicar cambios específicos, mejoras, optimizaciones, o puntos de atención directamente relacionados con las líneas de código afectadas en \`refactoredCode\`.
  //     * Si no hay comentarios específicos para líneas (ej. refactorización muy simple o solo análisis general), este campo debe ser una array vacía \`[]\`.


  // 4.  \`unitTests\` (string):
  //     * Si el \`analysisMode\` es 'test', este campo contendrá el código ${outputLanguage} completo de **pruebas unitarias exhaustivas** para todas las clases y métodos relevantes del código proporcionado.
  //     * Las pruebas deben usar el framework más común en ${outputLanguage} (ej: \`unittest\` para Python, Jest para JS).
  //     * Deben incluir pruebas para casos normales, límites y errores.
  //     * Los comentarios deben estar **dentro del código de las pruebas** explicando qué prueba se realiza y por qué es importante.
  //     * **IMPORTANTE**: NO incluyas el código original de las clases principales dentro de este campo, solo el código de las pruebas unitarias.
  //     * Si el \`analysisMode\` NO es 'test', este campo debe ser una cadena vacía \`""\` o una cadena con un mensaje como 'Este modo no genera pruebas unitarias.'.

  // 5.  \`securityAnalysis\` (string):
  //     * Si el \`analysisMode\` es 'security', este campo contendrá un informe detallado en texto plano (Markdown opcional para formato, pero sin bloques de código) del **análisis de seguridad** del código.
  //     * Identificará posibles vulnerabilidades comunes (ej. inyección, manejo de datos sensibles, validación de entrada deficiente, XSS, SQLi, CSRF, RCE, etc.), riesgos y sugerencias de mitigación.
  //     * Dominio profundo de OWASP Top 10 y estándares CWE, CVE, NIST.
  //     * **IMPORTANTE**: NO incluyas el código original ni ninguna refactorización del código dentro de este campo, solo el informe de análisis de seguridad.
  //     * Si el \`analysisMode\` NO es 'security', este campo debe ser una cadena vacía \`""\` o una cadena con un mensaje como 'Este modo no realiza un análisis de seguridad.'.

  // 6.  \`flowchartDescription\` (string):
  //     * Contendrá una descripción detallada en texto plano (Markdown opcional) de cómo se podría representar la lógica principal del programa en un diagrama de flujo, describiendo los pasos clave y las decisiones. Esto es útil para la comprensión gráfica del código.
  //     * Este campo siempre debe generarse, independientemente del modo.

  // // ...
  // **Reglas Generales de la Respuesta JSON:**
  // -   La respuesta debe ser **EXCLUSIVAMENTE el objeto JSON**, sin ningún texto adicional, preámbulo o post-ámbulo.
  // -   El JSON debe ser **válido** y estar bien formateado.
  // -   **Todos los campos listados arriba (refactoredCode, refactoringSummary, inlineComments, etc.) deben estar presentes en el JSON final.**
  // -   Cada campo del JSON debe contener el texto solicitado, o una cadena vacía \`""\` si no aplica para el modo actual o si no hay contenido, o un array vacío \`[]\` para \`inlineComments\` si no hay comentarios.

  // ---

  // ### **Instrucciones Adicionales Específicas para el Modo (\`${analysisMode}\`):**
  // ${instruction}

  // ### **Código a Procesar (Lenguaje: \`${inputLanguage}\`):**

  // \`\`\`${inputLanguage}
  // ${code}
  // \`\`\`

  // ### ** Formato de Respuesta Requerido(JSON);
  // json
  // {
  // "refactoredCode"; ""
  // "refactoredCodeCommentsRaw"; ""
  // "refactoringSummary"; ""
  // "unitTests"; ""
  // "securityAnalysis"; ""
  // "flowchartDescription"; ""
  // }
  // Por favor, rellena el JSON de arriba basándote en las instrucciones y el código proporcionado.
  // `;


  // ... (El resto de tu código en geminiService.ts) ...


  try {
    functions.logger.info(`Realizando llamada a la API de Gemini para ${inputLanguage} → ${outputLanguage} [Modo: ${analysisMode}]`);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    functions.logger.info(`Respuesta de Gemini recibida: ${outputLanguage}`);
    return text;
  } catch (error) {
    functions.logger.error(`Error al llamar a la API de Gemini para ${inputLanguage}:`, error);
    throw new Error(`Fallo en análisis con Gemini: ${error instanceof Error ? error.message : String(error)}`);
  }
}
