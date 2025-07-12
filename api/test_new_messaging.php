<?php
require_once 'core/database.php';
require_once 'core/config.php';
require_once 'vendor/autoload.php';

use \Firebase\JWT\JWT;

// Helper function to create a JWT for a user
function create_test_jwt($user_id, $role, $name) {
    $payload = [
        "iss" => "your_issuer",
        "aud" => "your_audience",
        "iat" => time(),
        "nbf" => time(),
        "exp" => time() + 3600,
        "data" => [
            "id" => $user_id,
            "role" => $role,
            "name" => $name
        ]
    ];
    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

// Helper function to make a cURL request
function make_request($url, $method = 'GET', $data = null, $jwt = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $headers = ['Content-Type: application/json'];
    if ($jwt) {
        $headers[] = "Authorization: Bearer $jwt";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function run_test() {
    $base_url = 'http://localhost/api'; // Adjust if your local server is different
    $db = (new Database())->connect();

    echo "--- STARTING MESSAGING SYSTEM TEST ---\n";

    // 1. Setup: Create users and a project
    $admin = ['id' => 1, 'role' => 'admin', 'name' => 'Admin User'];
    $client = ['id' => 2, 'role' => 'client', 'name' => 'Client User'];
    $freelancer1 = ['id' => 3, 'role' => 'freelancer', 'name' => 'Freelancer One'];
    $freelancer2 = ['id' => 4, 'role' => 'freelancer', 'name' => 'Freelancer Two'];
    $project_id = 1; // Assuming a project with id=1 exists, with client_id=2

    // Clear previous test data
    $db->query("DELETE FROM messages");
    $db->query("DELETE FROM message_thread_participants");
    $db->query("DELETE FROM message_threads WHERE project_id = $project_id");

    $admin_jwt = create_test_jwt($admin['id'], $admin['role'], $admin['name']);
    $client_jwt = create_test_jwt($client['id'], $client['role'], $client['name']);
    $freelancer1_jwt = create_test_jwt($freelancer1['id'], $freelancer1['role'], $freelancer1['name']);

    // 2. Test: Freelancer sends a message in the combined thread
    echo "\n--- TEST: Freelancer sends message to project_client_admin_freelancer ---\n";
    $response = make_request(
        "$base_url/messages/send_project_message.php",
        'POST',
        ['project_id' => $project_id, 'text' => 'Hello from Freelancer 1, this needs approval.', 'thread_type' => 'project_client_admin_freelancer'],
        $freelancer1_jwt
    );
    assert($response['status'] === 'pending');
    echo "  [PASS] Freelancer message is marked as 'pending'.\n";
    $pending_message_id = $response['message_id'];

    // 3. Test: Client tries to view the message
    echo "\n--- TEST: Client fetches messages and should NOT see the pending message ---\n";
    $messages = make_request("$base_url/messages/get_project_messages.php?project_id=$project_id&thread_type=project_client_admin_freelancer", 'GET', null, $client_jwt);
    assert(count($messages) === 0);
    echo "  [PASS] Client cannot see the pending message.\n";

    // 4. Test: Admin views the message
    echo "\n--- TEST: Admin fetches messages and SHOULD see the pending message ---\n";
    $messages = make_request("$base_url/messages/get_project_messages.php?project_id=$project_id&thread_type=project_client_admin_freelancer", 'GET', null, $admin_jwt);
    assert(count($messages) === 1 && $messages[0]['status'] === 'pending');
    echo "  [PASS] Admin can see the pending message.\n";

    // 5. Test: Admin approves the message
    echo "\n--- TEST: Admin approves the message ---\n";
    $response = make_request(
        "$base_url/messages/moderate_message.php",
        'POST',
        ['message_id' => $pending_message_id, 'status' => 'approved'],
        $admin_jwt
    );
    assert(strpos($response['message'], 'updated to approved') !== false);
    echo "  [PASS] Admin successfully approved the message.\n";

    // 6. Test: Client can now see the approved message
    echo "\n--- TEST: Client fetches messages again and SHOULD see the approved message ---\n";
    $messages = make_request("$base_url/messages/get_project_messages.php?project_id=$project_id&thread_type=project_client_admin_freelancer", 'GET', null, $client_jwt);
    assert(count($messages) === 1 && $messages[0]['status'] === 'approved');
    echo "  [PASS] Client can now see the approved message.\n";

    // 7. Test: Client sends a message (should be auto-approved)
    echo "\n--- TEST: Client sends a message ---\n";
    $response = make_request(
        "$base_url/messages/send_project_message.php",
        'POST',
        ['project_id' => $project_id, 'text' => 'Hello from Client, I see your message.', 'thread_type' => 'project_client_admin_freelancer'],
        $client_jwt
    );
    assert($response['status'] === 'approved');
    echo "  [PASS] Client's message is auto-approved.\n";

    // 8. Test: Freelancer can see the client's message
    echo "\n--- TEST: Freelancer fetches messages and should see both approved messages ---\n";
    $messages = make_request("$base_url/messages/get_project_messages.php?project_id=$project_id&thread_type=project_client_admin_freelancer", 'GET', null, $freelancer1_jwt);
    assert(count($messages) === 2);
    echo "  [PASS] Freelancer can see both approved messages.\n";

    echo "\n--- ALL TESTS PASSED ---\n";
}

run_test();
?>
