<?php
define('DB_HOST', '169.239.218.60');
define('DB_USER', 'architex_latest_user');
define('DB_PASS', 'Qwerty@1234$$$');
define('DB_NAME', 'architex_latest');

// JWT Secret Key
define('JWT_SECRET', 'a2u4j6k8m0n2b4v6c8x0z2q4w6e8r0t2y4u6i8o0p2l4k6j8h0g2f4d6s8a0');

// JWT Claims
define('JWT_ISSUER', 'your_issuer_here');
define('JWT_AUDIENCE', 'your_audience_here');

// Allowed origins for CORS
define('ALLOWED_ORIGINS', serialize([
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    // Add other allowed origins as needed
]));

// Whitelist of allowed table names for column_exists function
define('ALLOWED_TABLES', serialize([
    'users',
    'projects',
    'messages',
    'assignments',
    'notifications',
    'project_members',
    // Add other valid table names here
]));
?>
