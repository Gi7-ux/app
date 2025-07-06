<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if (!$jwt) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
    exit;
}

try {
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
    $admin_user_id = $decoded->data->id;
    $admin_user_name = $decoded->data->name ?? 'Admin';
    $user_role = $decoded->data->role;

    if ($user_role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Access denied. Only admins can send broadcast messages."));
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token.", "error" => $e->getMessage()));
    exit;
}

$message_text = $data->message_text ?? null;
$recipient_scope = $data->recipient_scope ?? null; // 'all', 'project', 'specific_users'
$project_id = $data->project_id ?? null;
$target_user_ids = $data->user_ids ?? []; // Array of user IDs for 'specific_users'

if (empty($message_text) || empty($recipient_scope)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing message_text or recipient_scope."));
    exit;
}

$allowed_scopes = ['all', 'project', 'specific_users'];
if (!in_array($recipient_scope, $allowed_scopes)) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid recipient_scope. Allowed: " . implode(', ', $allowed_scopes)));
    exit;
}

if ($recipient_scope === 'project' && empty($project_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Project ID is required for project-specific broadcasts."));
    exit;
}

if ($recipient_scope === 'specific_users' && empty($target_user_ids)) {
    http_response_code(400);
    echo json_encode(array("message" => "User IDs are required for specific_users broadcasts."));
    exit;
}

$recipients = [];
$thread_type = '';
$thread_subject = '';
$thread_project_id = null;

try {
    $db->beginTransaction();

    switch ($recipient_scope) {
        case 'all':
            $thread_type = 'system_broadcast';
            $thread_subject = "System Announcement";
            $stmt = $db->prepare("SELECT id FROM users WHERE status = 'active'"); // Or any other criteria for "all users"
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $recipients[] = $row['id'];
            }
            break;

        case 'project':
            $thread_type = 'project_broadcast';
            $thread_project_id = $project_id;

            $project_stmt = $db->prepare("SELECT title, client_id, freelancer_id FROM projects WHERE id = :project_id");
            $project_stmt->bindParam(':project_id', $project_id);
            $project_stmt->execute();
            $project = $project_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$project) {
                http_response_code(404); echo json_encode(array("message" => "Project not found for broadcast.")); $db->rollBack(); exit;
            }
            $thread_subject = "Announcement for Project: " . ($project['title'] ?: "ID $project_id");
            if ($project['client_id']) $recipients[] = $project['client_id'];
            if ($project['freelancer_id']) $recipients[] = $project['freelancer_id'];
            // Optionally add admins associated with the project or all admins
            // For simplicity, broadcast to client & freelancer. Admins can see project threads anyway.
            $recipients = array_unique($recipients);
            break;

        case 'specific_users':
            $thread_type = 'admin_direct_multiuser'; // Or just 'admin_broadcast_specific'
            $thread_subject = "Message from Admin";
            // Validate user_ids exist
            if (!empty($target_user_ids)) {
                $placeholders = rtrim(str_repeat('?,', count($target_user_ids)), ',');
                $user_check_stmt = $db->prepare("SELECT id FROM users WHERE id IN ($placeholders)");
                $user_check_stmt->execute($target_user_ids);
                $valid_user_count = $user_check_stmt->rowCount();
                if ($valid_user_count !== count($target_user_ids)) {
                     http_response_code(400); echo json_encode(array("message" => "One or more specified user IDs are invalid.")); $db->rollBack(); exit;
                }
                $recipients = $target_user_ids;
            }
            break;
    }

    if (empty($recipients)) {
        http_response_code(400);
        echo json_encode(array("message" => "No recipients found for this broadcast."));
        $db->rollBack();
        exit;
    }

    // Create a new thread for this broadcast
    $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (project_id, type, subject) VALUES (:project_id, :type, :subject)");
    $insert_thread_stmt->bindParam(':project_id', $thread_project_id, $thread_project_id ? PDO::PARAM_INT : PDO::PARAM_NULL);
    $insert_thread_stmt->bindParam(':type', $thread_type);
    $insert_thread_stmt->bindParam(':subject', $thread_subject);
    $insert_thread_stmt->execute();
    $thread_id = $db->lastInsertId();

    // Add admin as a participant (sender)
    $add_admin_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
    $add_admin_participant_stmt->bindParam(':thread_id', $thread_id);
    $add_admin_participant_stmt->bindParam(':user_id', $admin_user_id); // Admin is the sender
    $add_admin_participant_stmt->execute();

    // Add recipients as participants
    $add_recipient_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
    foreach ($recipients as $recipient_id) {
        if ($recipient_id == $admin_user_id) continue; // Admin already added
        $add_recipient_participant_stmt->bindParam(':thread_id', $thread_id);
        $add_recipient_participant_stmt->bindParam(':user_id', $recipient_id);
        $add_recipient_participant_stmt->execute();
    }

    // Insert the actual message
    $insert_message_stmt = $db->prepare("INSERT INTO messages (thread_id, sender_id, text, status) VALUES (:thread_id, :sender_id, :text, 'approved')");
    $insert_message_stmt->bindParam(':thread_id', $thread_id);
    $insert_message_stmt->bindParam(':sender_id', $admin_user_id);
    $insert_message_stmt->bindParam(':text', $message_text);
    $insert_message_stmt->execute();
    $message_id = $db->lastInsertId();

    // Create notifications for recipients
    $notification_text = "New broadcast message from {$admin_user_name}: " . substr($message_text, 0, 50) . "...";
    $link = $thread_project_id ? "/projects/{$thread_project_id}?tab=messages&thread_id={$thread_id}" : "/messages?thread_id={$thread_id}";

    $notify_stmt = $db->prepare("INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)");
    foreach ($recipients as $recipient_id) {
        if ($recipient_id == $admin_user_id) continue; // Don't notify admin about their own broadcast
        $notify_stmt->bindParam(':user_id', $recipient_id);
        $notify_stmt->bindParam(':message', $notification_text);
        $notify_stmt->bindParam(':link', $link);
        $notify_stmt->execute();
    }

    $db->commit();
    http_response_code(201);
    echo json_encode(array(
        "message" => "Broadcast message sent successfully.",
        "thread_id" => $thread_id,
        "message_id" => $message_id,
        "recipient_count" => count($recipients)
    ));

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
