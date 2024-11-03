// @ts-check
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import pluginReactCompiler from "eslint-plugin-react-compiler";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import vitestPlugin from "eslint-plugin-vitest";
import tseslint from "typescript-eslint";

import compilerOptions from "./compilerOptions.js";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  // @ts-expect-error Malformed types
  reactPlugin.configs.flat.recommended,
  // @ts-expect-error Malformed types
  reactPlugin.configs.flat["jsx-runtime"],
  {
    // TODO replace with https://github.com/facebook/react/pull/30774
    name: "react-hooks/recommended",
    plugins: { "react-hooks": reactHooksPlugin },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  {
    plugins: {
      "react-compiler": pluginReactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": ["error", compilerOptions],
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
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/prop-types": "off",
      "react/jsx-fragments": ["warn", "syntax"],
      "react/jsx-curly-brace-presence": ["warn", "never"],
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["css"],
        },
      ],

      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "no-nested-ternary": "warn",
      "no-unreachable": "warn",
      "linebreak-style": ["warn", "unix"],
      eqeqeq: ["warn", "smart"],
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "TSEnumDeclaration",
          message: "Don't declare enums",
        },
      ],
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "@ionic/react",
              importNames: ["IonHeader"],
              message: "Please use AppHeader instead.",
            },
            {
              name: "react",
              importNames: ["forwardRef"],
              message: "Please use ref prop directly.",
            },
          ],
          patterns: [
            {
              regex: "\\.\\.\\/\\w+\\/",
              message: "Import via absolute path (e.g. #/helpers/myHelper)",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
    },
  },
);
