import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Convert errors to warnings
      "@typescript-eslint/no-explicit-any": "warn", // Convert to warning for Razorpay types
      "@typescript-eslint/no-require-imports": "warn", // Convert to warning
      "@next/next/no-img-element": "warn", // Convert to warning for now
    },
  },
];

export default eslintConfig;
