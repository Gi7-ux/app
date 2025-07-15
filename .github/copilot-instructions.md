# Copilot Instructions for AXIS Architex Management Suite

## Project Architecture & Key Concepts
- **Monorepo Structure:** Contains both backend (PHP API in `api/`) and frontend (React/Vite in `src/`).
- **User Roles:** Admin, Client, Freelancer. Each role has distinct permissions and workflows (see `README.md`).
- **Major Features:** Project management, messaging (threaded, project-specific, admin broadcasts, moderation), file uploads (per-project, secure), billing/payments, time tracking, notifications.
- **Backend API:** Organized by feature in `api/`. Endpoints are PHP scripts (see `api/messages/`, `api/files/`, `api/payments/`, etc.).
- **Frontend:** React components in `src/features/`, with supporting code in `src/core/`, `src/services/`, and `src/utils/`.

## Developer Workflows
- **Build:** `npm run build` (Vite)
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Single Test:** `npm run test -- <test_file_path>`
- **Backend Testing:** Use `phpunit` for API tests (see `api/phpunit.xml`).
- **Database:** SQLite for local/dev (`api/data/axis-java.db`). Migrations in `api/migrations/`.

## Project-Specific Patterns & Conventions
- **React Components:** Use PascalCase for files and components. Organize by feature in `src/features/`.
- **API Calls:** Use ES module imports. API endpoints are called via fetch/Axios from frontend services (`src/services/`).
- **Messaging:** Threads are created/ensured via `ensure_thread.php`. Admins can add participants and moderate messages.
- **File Uploads:** Files are uploaded per project and optionally linked to messages. See `api/files/upload.php`.
- **Payments:** Payment records update project/user financial summaries. Admin-only for updates/deletes.
- **Notifications:** Real-time notifications via polling or websockets (see `api/notifications/`).

## Integration Points
- **External Libraries:** PHP Composer for backend (`api/composer.json`), npm for frontend (`package.json`).
- **Testing:** Vitest for frontend, PHPUnit for backend.
- **Database:** SQLite, migrations in `api/migrations/`.

## Examples & References
- **Messaging Workflow:** See `messaging_workflow.md` and `api/messages/` for thread/participant logic.
- **File Management:** See `api/files/` and frontend file upload components in `src/features/Files/`.
- **Payments:** See `api/payments/` for payment logic and financial summary updates.
- **Notifications:** See `api/notifications/` and notification logic in frontend features.

## Additional Notes
- **Error Handling:** Use standard JS error boundaries in React; PHP uses try/catch and error logging (`api/logs/`).
- **Styling:** CSS modules or styled-components in frontend.
- **Prop Validation:** Use prop-types for React components.

---
For more details, see `README.md`, `AGENTS.md`, and feature-specific docs in the repo.
