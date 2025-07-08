# Tech Context

- Core Technologies Used
  - PHP (Backend)
  - React (Frontend)
  - MySQL (Database)
  - Vite (Development Server)

- Technical Patterns
  - **JWT Integration**: Secure token authentication in ProjectManagement.jsx
  - **JSON Data Handling**: Dynamic data parsing for projects and invoices
  - **Financial Tracking**: Integration with billing reports
  - **API Proxy Setup**: Vite proxy configuration for development API routing
  - **Database Schema Management**: Migration-based database updates

- Current Technical Status (2025-07-07)
  - **Development Environment**:
    - Vite dev server running on port 5173
    - PHP built-in server on port 8000
    - Proxy configuration: `/api/*` → `http://localhost:8000/*`
  - **Database**:
    - Applications table: ✅ Created and populated
    - Files table: ✅ Column mapping corrected (`filename` → `name`)
    - Users table: ✅ All columns including `name` verified
  - **Authentication**:
    - JWT tokens working correctly
    - Login credentials: <admin@architex.co.za> / password

**2025-07-07 15:30**: Fixed critical API endpoint errors and verified full development environment setup.

**2025-07-05 11:02 AM**: Updated to reflect tech stack alignment with client project tracking and reporting functionalities. Integrated JWT authentication for secure client/freelancer management.
