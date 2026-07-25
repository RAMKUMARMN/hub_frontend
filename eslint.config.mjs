import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Ignore apostrophe and quote issues
      "react/no-unescaped-entities": "off",

      // Don't fail on unused variables
      "@typescript-eslint/no-unused-vars": "warn",

      // Allow 'any'
      "@typescript-eslint/no-explicit-any": "off",

      // Relax React Hooks rules
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",

      // Don't force next/image
      "@next/next/no-img-element": "warn",
    },
  },
]);