# Database Schema Fixes Applied

## Summary of Issues Found and Fixed

### 1. Missing columns in `message_threads` table

**Problem**: The PHP code expected `type` and `subject` columns that didn't exist.
**Fix**: Added the missing columns:

- `type VARCHAR(50) DEFAULT 'general'`
- `subject VARCHAR(255)`

### 2. Missing `message_thread_participants` table

**Problem**: The messaging system expected a participant table that didn't exist.
**Fix**: Created the table with proper foreign key relationships.

### 3. Missing `tasks` table

**Problem**: The assignments system tried to save tasks to a non-existent table.
**Fix**: Created the `tasks` table with proper structure:

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    assigned_to INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
)
```

### 4. Incorrect database functions in utils.php

**Problem**: Using MySQL syntax (`SHOW TABLES`, `SHOW COLUMNS`) in SQLite database.
**Fix**: Updated functions to use SQLite-compatible syntax.

### 5. Incorrect permission checking

**Problem**: Referenced non-existent `project_members` table.
**Fix**: Updated to check project relationships (`client_id`, `freelancer_id`) and admin roles.

### 6. Fixed file query mismatch

**Problem**: Files query used incorrect column names.
**Fix**: Updated query to use actual database column names (`uploaded_by`, `filename`, etc.).

## Files Modified

1. `fix_message_schema.php` - Script to add missing message columns and table
2. `fix_tasks_table.php` - Script to create missing tasks table
3. `api/core/utils.php` - Updated database functions and permission checking
4. `api/assignments/get.php` - Fixed token property access
5. `api/files/get_files.php` - Fixed column name mappings

## Testing the Fixes

The server appears to be running and responding (getting 401 for invalid tokens is expected behavior).

To test the fixes:

1. **Login to get a valid JWT token**:

   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5173/api/auth/login.php" -Method POST -Body '{"email":"your@email.com","password":"yourpassword"}' -ContentType "application/json"
   ```

2. **Test assignments endpoint** (replace TOKEN with actual token):

   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5173/api/assignments/get.php?project_id=1" -Headers @{"Authorization" = "Bearer TOKEN"} -Method GET
   ```

3. **Test messaging endpoint**:

   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5173/api/messages/ensure_thread.php" -Headers @{"Authorization" = "Bearer TOKEN"} -Method POST -Body '{"type":"project_communication","project_id":1}' -ContentType "application/json"
   ```

4. **Test files endpoint**:

   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5173/api/files/get_files.php?project_id=1" -Headers @{"Authorization" = "Bearer TOKEN"} -Method GET
   ```

## Current Database Schema Status

All required tables now exist with proper relationships:

- ✅ assignments (with title column)
- ✅ tasks (newly created)
- ✅ message_threads (with type and subject columns)
- ✅ message_thread_participants (newly created)
- ✅ files (with correct column mappings)

The 500 Internal Server Errors should now be resolved. Any remaining 401/403 errors are related to authentication/authorization, which is working as expected.
