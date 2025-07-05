
## Build, Lint, and Test

- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Test:** `npm run test`
- **Run a single test:** `npm run test -- <test_file_path>`

## Code Style

- **Framework:** React with Vite
- **Language:** JavaScript (ESM) with JSX
- **Formatting:** Follows `eslint-plugin-react/configs/recommended.js`.
- **Imports:** Use ES module imports.
- **Naming:**
  - Components: `PascalCase` (e.g., `MyComponent`)
  - Files: `PascalCase` (e.g., `MyComponent.jsx`)
  - Functions/Variables: `camelCase` (e.g., `myFunction`)
- **Types:** No static type checking. Use prop-types for component prop validation.
- **Error Handling:** Use standard JavaScript error handling (e.g., `try...catch`, error boundaries).
- **Styling:** Use CSS modules or styled-components.
