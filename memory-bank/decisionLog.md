# Decision Log

[2025-07-07 15:30:00] - API Error Resolution Strategy

- **Decision**: Fixed database schema mismatches instead of changing frontend code
- **Rationale**: The frontend was correctly structured, the backend had column naming inconsistencies
- **Impact**: Fixed files table query by mapping `filename` to `name` alias in SQL
- **Alternative Considered**: Changing frontend to match backend - rejected due to API consistency

[2025-07-07 15:25:00] - Authentication Password Correction

- **Decision**: Updated login credentials from 'PASSWORD' to 'password'
- **Rationale**: Actual database stored password hash matches 'password'
- **Impact**: Resolved all 401 authentication errors across API endpoints

[2025-07-07 15:20:00] - Vite Proxy Configuration Fix

- **Decision**: Enabled path rewriting in Vite proxy to strip /api prefix
- **Rationale**: PHP server serves from api directory as root, needs path translation
- **Impact**: Frontend can now access APIs through <http://localhost:5173/api/>*

[2025-07-05 11:02:09 AM] - Documented PRD creation using code analysis. Established project tracking as core business objective and authenticated user flows as secondary features.
