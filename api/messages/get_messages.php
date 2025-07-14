<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';
require_once '../migrations/run_migrations.php';

// Ensure messaging tables are properly set up
run_critical_migrations();

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

// Inputs: Expecting project_id OR thread_id. Project_id takes precedence for project-specific views.
$project_id = isset($_GET['project_id']) ? (int)$_GET['project_id'] : null;
$thread_id_param = isset($_GET['thread_id']) ? (int)$_GET['thread_id'] : null;

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
    $user_id = $decoded->data->id;
    $user_role = $decoded->data->role;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token.", "error" => $e->getMessage()));
    exit;
}

$target_thread_ids = [];

try {
    if ($project_id) {
        // User wants messages for a specific project.
        // Verify user is part of this project (client, freelancer, or admin).
        $project_check_stmt = $db->prepare("SELECT client_id, freelancer_id FROM projects WHERE id = :project_id");
        $project_check_stmt->bindParam(':project_id', $project_id);
        $project_check_stmt->execute();
        $project_roles = $project_check_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project_roles) {
            http_response_code(404);
            echo json_encode(array("message" => "Project not found."));
            exit;
        }

        $is_project_member = ($user_role === 'admin' || $user_id == $project_roles['client_id'] || $user_id == $project_roles['freelancer_id']);
        if (!$is_project_member) {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. You are not a member of this project."));
            exit;
        }

        // Find relevant threads for this project that the user is a participant of.
        // These are 'project_communication' and 'client_admin' (if user is client/admin).
        $thread_types_to_fetch = ["'project_communication'"];
        if ($user_role === 'client' || $user_role === 'admin') {
            $thread_types_to_fetch[] = "'client_admin'";
        }
        $thread_types_str = implode(",", $thread_types_to_fetch);

        $threads_stmt = $db->prepare("
            SELECT mt.id
            FROM message_threads mt
            JOIN message_thread_participants mtp ON mt.id = mtp.thread_id
            WHERE mt.project_id = :project_id
            AND mt.type IN ({$thread_types_str})
            AND mtp.user_id = :user_id
        ");
        $threads_stmt->bindParam(':project_id', $project_id);
        $threads_stmt->bindParam(':user_id', $user_id);
        $threads_stmt->execute();
        
        while ($row = $threads_stmt->fetch(PDO::FETCH_ASSOC)) {
            $target_thread_ids[] = $row['id'];
        }

        if (empty($target_thread_ids) && $thread_id_param) {
            // If project_id was given but no project-specific threads were found for the user,
            // but a specific thread_id was ALSO given, check if that thread_id is valid for the project and user.
             $verify_thread_stmt = $db->prepare("
                SELECT mt.id FROM message_threads mt
                JOIN message_thread_participants mtp ON mt.id = mtp.thread_id
                WHERE mt.id = :thread_id AND mt.project_id = :project_id AND mtp.user_id = :user_id
            ");
            $verify_thread_stmt->bindParam(':thread_id', $thread_id_param);
            $verify_thread_stmt->bindParam(':project_id', $project_id);
            $verify_thread_stmt->bindParam(':user_id', $user_id);
            $verify_thread_stmt->execute();
            if($verified_thread = $verify_thread_stmt->fetch(PDO::FETCH_ASSOC)){
                $target_thread_ids[] = $verified_thread['id'];
            }
        }

    } elseif ($thread_id_param) {
        // User wants messages for a specific thread_id directly.
        // Verify user is a participant of this thread.
        $verify_stmt = $db->prepare("SELECT mt.id FROM message_threads mt JOIN message_thread_participants mtp ON mt.id = mtp.thread_id WHERE mtp.thread_id = :thread_id AND mtp.user_id = :user_id");
        $verify_stmt->bindParam(':thread_id', $thread_id_param);
        $verify_stmt->bindParam(':user_id', $user_id);
        $verify_stmt->execute();
        if ($verified_thread = $verify_stmt->fetch(PDO::FETCH_ASSOC)) {
             $target_thread_ids[] = $verified_thread['id'];
        } else {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. You are not a participant of this thread or thread does not exist."));
            exit;
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing project_id or thread_id parameter."));
        exit;
    }

    if (empty($target_thread_ids)) {
        // No relevant threads found for the user for this project, or access denied.
        http_response_code(200); // Or 404 if preferred when no messages
        echo json_encode(array()); // Return empty array
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($target_thread_ids), '?'));

    // Base query
    $query_string = "SELECT m.id, m.thread_id, m.sender_id, m.text, m.file_id, m.created_at, m.status, u.name as sender_name, u.avatar as sender_avatar
              FROM messages m
              JOIN users u ON m.sender_id = u.id
              WHERE m.thread_id IN ({$placeholders})";

    // Apply visibility rules
    if ($user_role !== 'admin') {
        $query_string .= " AND (m.status = 'approved' OR (m.status = 'pending' AND m.sender_id = ?))";
    }

    $query_string .= " ORDER BY m.created_at ASC";

    $stmt = $db->prepare($query_string);

    // Bind thread IDs
    foreach ($target_thread_ids as $k => $id) {
        $stmt->bindValue(($k + 1), $id, PDO::PARAM_INT);
    }
    // Bind user_id for pending message check if not admin
    if ($user_role !== 'admin') {
        $stmt->bindValue(count($target_thread_ids) + 1, $user_id, PDO::PARAM_INT);
    }

    $stmt->execute();

    $messages_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $message_item = array(
            "id" => $row['id'],
            "thread_id" => $row['thread_id'],
            "sender_id" => $row['sender_id'],
            "sender_name" => $row['sender_name'],
            "sender_avatar" => $row['sender_avatar'],
            "text" => $row['text'],
            "file_id" => $row['file_id'],
            "timestamp" => $row['created_at'],
            "status" => $row['status']
        );
        array_push($messages_arr, $message_item);
    }

    http_response_code(200);
    echo json_encode($messages_arr);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
} catch (Exception $e) {
    // Catching generic Exception for broader error handling, though specific exceptions are better if known
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
}
?>
