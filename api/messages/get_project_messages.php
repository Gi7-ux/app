<?php
require_once '../core/database.php';
require_once '../core/utils.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->connect();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if (!$jwt) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized: No token provided."]);
    exit();
}

try {
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
    $user_id = $decoded->data->id;
    $user_role = $decoded->data->role;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        "message" => "Unauthorized: Invalid token.",
        "error" => $e->getMessage()
    ]);
    exit();
}

$project_id = $_GET['project_id'] ?? null;
$thread_type = $_GET['thread_type'] ?? null;

if (!is_numeric($project_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid or missing project_id."]);
    exit();
}
$project_id = (int)$project_id;

$allowed_thread_types = ['project_client_admin_freelancer', 'project_admin_client', 'project_admin_freelancer'];
if (!$thread_type || !in_array($thread_type, $allowed_thread_types)) {
    http_response_code(400);
    echo json_encode(["message" => "A valid thread_type is required."]);
    exit();
}

try {
    // 1. Find the thread_id
    $stmt = $db->prepare("SELECT id FROM message_threads WHERE project_id = :project_id AND type = :type");
    $stmt->bindParam(':project_id', $project_id);
    $stmt->bindParam(':type', $thread_type);
    $stmt->execute();
    $thread_id = $stmt->fetchColumn();

    if (!$thread_id) {
        // No thread found, return empty array. It will be created on first message.
        echo json_encode([]);
        exit();
    }

    // 2. Verify user is a participant of the thread
    $part_stmt = $db->prepare("SELECT COUNT(*) FROM message_thread_participants WHERE thread_id = :thread_id AND user_id = :user_id");
    $part_stmt->bindParam(':thread_id', $thread_id);
    $part_stmt->bindParam(':user_id', $user_id);
    $part_stmt->execute();
    if ($part_stmt->fetchColumn() == 0) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden: You are not a participant of this message thread."]);
        exit();
    }

    // 3. Construct the query with visibility rules
    $sql = "SELECT m.id, m.thread_id, m.sender_id, u.name as sender_name, u.role as sender_role, m.text, m.status, m.created_at
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.thread_id = :thread_id";

    // Visibility logic based on the user's role
    if ($user_role === 'client') {
        // Clients only see 'approved' messages
        $sql .= " AND m.status = 'approved'";
    } elseif ($user_role === 'freelancer') {
        // Freelancers see their own messages regardless of status, but only 'approved' messages from others.
        $sql .= " AND (m.status = 'approved' OR m.sender_id = :user_id)";
    }
    // Admins can see all messages (no additional status filter needed)

    $sql .= " ORDER BY m.created_at ASC";

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':thread_id', $thread_id);
    if ($user_role === 'freelancer') {
        $stmt->bindParam(':user_id', $user_id);
    }

    $stmt->execute();
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($messages);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get project messages failed: " . $e->getMessage());
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Get project messages failed: " . $e->getMessage());
    echo json_encode(["message" => "An unexpected error occurred.", "error" => $e->getMessage()]);
}
?>
