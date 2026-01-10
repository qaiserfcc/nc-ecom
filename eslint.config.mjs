import js from "@eslint/js";
import globals from "globals";
import next from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

const nextCoreWebVitals = next.configs["core-web-vitals"];

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "lib/utils/notifications.ts",
      "scripts/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "prefer-const": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ...nextCoreWebVitals,
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      ...(nextCoreWebVitals.rules ?? {}),
      "@next/next/no-inline-styles": "off",
    },
  }
);
