import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import pluginReactCompiler from "eslint-plugin-react-compiler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended",
    ),
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "react-compiler": pluginReactCompiler,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/react-in-jsx-scope": "off",

      "react-compiler/react-compiler": "error",

      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],

      "react-compiler/react-compiler": "error",

      "linebreak-style": ["warn", "unix"],
      "react/jsx-fragments": ["warn", "syntax"],
      "@typescript-eslint/no-empty-function": 0,
      "@typescript-eslint/no-empty-object-type": 0,
      "@typescript-eslint/no-empty-interface": 0,
      "react/jsx-curly-brace-presence": ["warn", "never"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Don't declare enums",
        },
      ],
      eqeqeq: ["warn", "smart"],
      "no-unreachable": ["warn"],

      "react/no-unknown-property": [
        "error",
        {
          ignore: ["css"],
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "react/prop-types": 0,

      "no-restricted-imports": [
        1,
        {
          paths: [
            {
              name: "@ionic/react",
              importNames: ["IonHeader"],
              message: "Please use AppHeader instead.",
            },
          ],
        },
      ],

      "no-nested-ternary": [1],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],

    languageOptions: {
      globals: {
        ...globals.jest,
        global: "writable",
      },
    },
  },
  {
    files: ["src/**"],

    languageOptions: {
      globals: {
        APP_VERSION: true,
        BUILD_FOSS_ONLY: true,
      },
    },
  },
];
