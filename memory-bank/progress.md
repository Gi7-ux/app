[MEMORY BANK: ACTIVE]
[2025-07-06 12:44:42] - Added Authorization header format validation to `api/auth/check_token.php`.
[2025-07-07 15:30:00] - Fixed critical API errors:

- ✅ Fixed 404 error in applications endpoint - table was missing, migration created it
- ✅ Fixed 401 error in projects endpoint - SQL column mismatch in files table query
- ✅ Fixed authentication - password is 'password' not 'PASSWORD'
- ✅ Fixed Vite proxy configuration for API routing
- ✅ Verified both servers running: Vite (5173) and PHP (8000)
- ✅ All API endpoints now working: applications.php and read_one.php
