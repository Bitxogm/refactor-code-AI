module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  // ESTA ES LA ÚNICA SECCIÓN 'ignorePatterns'
  // Hemos fusionado todas las reglas de ignorancia aquí
  ignorePatterns: [
    "/lib/**/*", // Ignorar archivos compilados en 'lib'
    "/generated/**/*", // Ignorar archivos generados (que estaban en la segunda sección)
    "src/**/*.js", // Ignorar archivos .js en 'src'
    "src/**/*.js.map", // Ignorar archivos .js.map en 'src'
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": "off",
    "eol-last": "off",
    "require-jsdoc": "off",
  },
};