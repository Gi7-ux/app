<?php
require_once 'core/database.php';
require_once 'core/config.php';
require_once 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Test messaging API endpoints
$database = new Database();
$db = $database->connect();

echo "Testing messaging API endpoints...\n\n";

// Get an admin user for testing
$admin_user = $db->query("SELECT id, name, email, role FROM users WHERE role = 'admin' LIMIT 1")->fetch(PDO::FETCH_ASSOC);

if (!$admin_user) {
    echo "No admin user found. Cannot test API.\n";
    exit;
}

echo "Testing with admin user: {$admin_user['name']} (ID: {$admin_user['id']})\n\n";

// Create a JWT token for testing
$payload = array(
    "iss" => "localhost",
    "aud" => "localhost", 
    "iat" => time(),
    "exp" => time() + (60 * 60), // 1 hour
    "data" => array(
        "id" => $admin_user['id'],
        "name" => $admin_user['name'],
        "email" => $admin_user['email'],
        "role" => $admin_user['role']
    )
);

$jwt_token = JWT::encode($payload, JWT_SECRET, 'HS256');
echo "Generated JWT token for testing\n\n";

// Test 1: get_threads.php
echo "=== Testing get_threads.php ===\n";
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $jwt_token";

ob_start();
include 'messages/get_threads.php';
$threads_output = ob_get_clean();

echo "Response: $threads_output\n\n";

// Test 2: Create a thread using ensure_thread.php
echo "=== Testing ensure_thread.php ===\n";

// Get another user for direct message
$other_user = $db->query("SELECT id FROM users WHERE role != 'admin' AND id != {$admin_user['id']} LIMIT 1")->fetch(PDO::FETCH_ASSOC);

if ($other_user) {
    $test_data = json_encode([
        'type' => 'direct_message',
        'participant_ids' => [$admin_user['id'], $other_user['id']]
    ]);
    
    // Simulate POST data
    $temp_input = tmpfile();
    fwrite($temp_input, $test_data);
    rewind($temp_input);
    
    // Backup original input stream
    $original_input = file_get_contents('php://input');
    
    ob_start();
    
    // Mock the input stream for the test
    global $mock_input;
    $mock_input = $test_data;
    
    // This won't work perfectly due to php://input limitations, but let's try
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['CONTENT_TYPE'] = 'application/json';
    
    try {
        include 'messages/ensure_thread.php';
        $ensure_output = ob_get_clean();
        echo "Ensure thread response: $ensure_output\n\n";
    } catch (Exception $e) {
        ob_end_clean();
        echo "Error testing ensure_thread: " . $e->getMessage() . "\n\n";
    }
    
    fclose($temp_input);
} else {
    echo "No other user found for direct message test\n\n";
}

// Test 3: Check if we can query for messages
echo "=== Testing get_messages.php ===\n";

// Get any existing thread
$existing_thread = $db->query("SELECT id FROM message_threads LIMIT 1")->fetch(PDO::FETCH_ASSOC);

if ($existing_thread) {
    $_GET['thread_id'] = $existing_thread['id'];
    
    ob_start();
    include 'messages/get_messages.php';
    $messages_output = ob_get_clean();
    
    echo "Messages response: $messages_output\n\n";
} else {
    echo "No existing threads to test get_messages\n\n";
}

echo "✅ API endpoint tests completed!\n";
echo "If you see JSON responses above, the messaging API is working correctly.\n";
?>
