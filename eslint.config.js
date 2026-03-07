// @ts-check

import eslint from "@eslint/js";
import vitestPlugin from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  reactHooks.configs.flat["recommended-latest"],
  {
    plugins: {
      perfectionist: perfectionistPlugin,
    },
    rules: {
      "perfectionist/sort-named-imports": [
        "warn",
        { ignoreCase: false, type: "natural", ignoreAlias: false },
      ],
      "perfectionist/sort-imports": [
        "warn",
        {
          newlinesBetween: 1,
          partitionByComment: true,
          type: "natural",
          ignoreCase: false,
          tsconfig: { rootDir: "." },
          sortSideEffects: true,
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "css-modules",
          ],
          customGroups: [
            {
              groupName: "css-modules",
              elementNamePattern: "\\.module\\.css$",
            },
          ],
        },
      ],
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-empty-function": "warn",
      "no-nested-ternary": "warn",
      "no-unreachable": "warn",
      "object-shorthand": "warn",
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
              importNames: ["IonHeader", "useIonToast", "IonPage"],
              message:
                "Has an App alternative. Replace 'Ion' with 'App' when importing.",
            },
            {
              name: "react",
              importNames: ["forwardRef"],
              message: "Please use ref prop directly.",
            },
            {
              name: "react",
              importNames: ["useContext"],
              message: "Please use use() instead.",
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

      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    ...vitestPlugin.configs.recommended,
  },
);
