# Notifications API 401 Error Fixes

## Issues Found and Fixed

### 1. Inconsistent Token Validation
**Problem**: `mark_read.php` was using inline JWT validation instead of the `validate_token()` utility function.
**Fix**: Updated to use the consistent `validate_token()` function like other endpoints.

### 2. Missing CORS Headers
**Problem**: Incomplete CORS headers causing preflight request failures.
**Fix**: Added comprehensive CORS headers to both files:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
```

### 3. Database Query Mismatch
**Problem**: `get.php` was trying to select a `link` column that doesn't exist in the notifications table.
**Fix**: Updated query to select correct columns:
```php
$query = "SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 10";
```

### 4. SQLite Boolean Handling
**Problem**: Using `TRUE` instead of `1` for SQLite boolean updates.
**Fix**: Changed to use `1` for SQLite compatibility:
```php
$query = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
```

## Files Modified

1. **api/notifications/get.php**
   - Added comprehensive CORS headers
   - Fixed database query to use correct column names
   - Already using `validate_token()` function correctly

2. **api/notifications/mark_read.php**
   - Replaced inline JWT validation with `validate_token()` function
   - Added comprehensive CORS headers
   - Fixed SQLite boolean handling

## Testing

Created test notification data successfully:
- ✅ User ID: 1 found
- ✅ Test notification created
- ✅ Notification verified in database
- ✅ Both PHP files have no syntax errors

## Database Schema Verified

The notifications table has the correct structure:
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## Next Steps

The 401 errors in notifications.php should now be resolved. The endpoints should work correctly with:

1. **GET /api/notifications/get.php** - Retrieves notifications for authenticated user
2. **POST /api/notifications/mark_read.php** - Marks notifications as read

Both endpoints now:
- ✅ Use consistent token validation
- ✅ Have proper CORS headers
- ✅ Use correct database queries
- ✅ Handle SQLite boolean values correctly
