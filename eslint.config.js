import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginJest from "eslint-plugin-jest";
import { fixupConfigRules } from "@eslint/compat";

export default [
  // Global ignores
  {
    ignores: [
      "build/",
      "dist/",
      "public/",
      "node_modules/",
      "api/vendor/",
      "coverage/",
      "*.lcov",
      // Add any other specific files or patterns to ignore
      // e.g., "src/someGeneratedFile.js"
    ]
  },
  // General configuration for all JS/JSX files
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn on unused vars, allow underscore prefix
      "no-prototype-builtins": "warn", // Warn on direct use of Object.prototype builtins
      "no-cond-assign": ["error", "except-parens"], // Allow assignment in conditional if in parens
      "no-empty": ["warn", { "allowEmptyCatch": true }] // Warn on empty blocks, but allow empty catch
    }
  },

  pluginJs.configs.recommended,
  ...fixupConfigRules(pluginReactConfig), // React specific rules

  // Jest specific configuration for test files
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/__tests__/**/*.{js,jsx}"],
    plugins: { // Correct way to register plugins in flat config
      jest: pluginJest
    },
    settings: { // Add settings block for Jest version
      jest: {
        version: 29 // Specify a Jest version (e.g., 29, or align with vitest's compat if known)
      }
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...pluginJest.configs.recommended.rules, // Apply Jest recommended rules
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error"
    }
  },
  // Specific overrides for puppeteer test files (if any remain after general node globals)
  {
    files: ["puppeteer-*.js"],
    languageOptions: {
        globals: {
            ...globals.node,
        }
    },
    rules: {
        // Puppeteer scripts are often not modules, so 'require' might be used.
        // If using ES modules for puppeteer, this might not be needed.
        // For now, assuming they might be commonJS:
        "no-undef": ["warn", { "typeof": true }], // Allow typeof check for undefined vars
        // Add specific puppeteer globals here if needed, e.g. page, browser
    }
  },
  // Configuration for files inside api/ (PHP backend related JS, if any, usually vendor so ignored)
  // If there were custom JS files in api/ that are NOT vendor, they could be configured here.
  // For now, api/vendor/ is ignored globally.
];
