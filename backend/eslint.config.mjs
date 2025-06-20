import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**"
    ]
  }
];
