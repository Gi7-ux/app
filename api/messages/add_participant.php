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
    $user_role = $decoded->data->role;

    if ($user_role !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Access denied. Only admins can add participants to threads."));
        exit;
    }

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token.", "error" => $e->getMessage()));
    exit;
}

// Required input: thread_id, user_id_to_add
$thread_id = $data->thread_id ?? null;
$user_id_to_add = $data->user_id_to_add ?? null;
// Optional: new_thread_type to change the thread type upon adding participant
$new_thread_type = $data->new_thread_type ?? null;


if (empty($thread_id) || empty($user_id_to_add)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing thread_id or user_id_to_add."));
    exit;
}

try {
    $db->beginTransaction();

    // Check if thread exists
    $thread_stmt = $db->prepare("SELECT id, type, project_id FROM message_threads WHERE id = :thread_id");
    $thread_stmt->bindParam(':thread_id', $thread_id);
    $thread_stmt->execute();
    $thread = $thread_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$thread) {
        http_response_code(404);
        echo json_encode(array("message" => "Thread not found."));
        $db->rollBack();
        exit;
    }

    // Check if user to add exists
    $user_stmt = $db->prepare("SELECT id, role FROM users WHERE id = :user_id");
    $user_stmt->bindParam(':user_id', $user_id_to_add);
    $user_stmt->execute();
    $user_to_add_details = $user_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_to_add_details) {
        http_response_code(404);
        echo json_encode(array("message" => "User to add not found."));
        $db->rollBack();
        exit;
    }

    // Check if user is already a participant
    $participant_check_stmt = $db->prepare("SELECT id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id = :user_id");
    $participant_check_stmt->bindParam(':thread_id', $thread_id);
    $participant_check_stmt->bindParam(':user_id', $user_id_to_add);
    $participant_check_stmt->execute();
    if ($participant_check_stmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "User is already a participant in this thread."));
        $db->rollBack();
        exit;
    }

    // Specific logic for adding a freelancer to a 'client_admin' project thread
    // If admin adds a freelancer to a 'client_admin' thread for a project,
    // the thread type could change to 'project_client_admin_freelancer'.
    if ($thread['type'] === 'client_admin' && $thread['project_id'] && $user_to_add_details['role'] === 'freelancer') {
        // Ensure this freelancer is assigned to this project
        $project_freelancer_stmt = $db->prepare("SELECT freelancer_id FROM projects WHERE id = :project_id");
        $project_freelancer_stmt->bindParam(':project_id', $thread['project_id']);
        $project_freelancer_stmt->execute();
        $project_freelancer = $project_freelancer_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project_freelancer || $project_freelancer['freelancer_id'] != $user_id_to_add) {
            http_response_code(400);
            echo json_encode(array("message" => "Cannot add freelancer: Freelancer is not assigned to this project."));
            $db->rollBack();
            exit;
        }
        // Suggest or automatically set new thread type
        if (empty($new_thread_type)) {
            $new_thread_type = 'project_client_admin_freelancer';
        }
    }


    // Add participant
    $add_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
    $add_stmt->bindParam(':thread_id', $thread_id);
    $add_stmt->bindParam(':user_id', $user_id_to_add);

    if (!$add_stmt->execute()) {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to add participant."));
        $db->rollBack();
        exit;
    }

    // Update thread type if specified and different
    if ($new_thread_type && $new_thread_type !== $thread['type']) {
        $update_type_stmt = $db->prepare("UPDATE message_threads SET type = :new_type WHERE id = :thread_id");
        $update_type_stmt->bindParam(':new_type', $new_thread_type);
        $update_type_stmt->bindParam(':thread_id', $thread_id);
        if (!$update_type_stmt->execute()) {
            // Log error, but proceed as participant was added. Or make it critical.
            // For now, let's consider it non-critical if participant is added but type update fails.
            error_log("Failed to update thread type for thread ID: $thread_id to $new_thread_type");
        }
    }

    $db->commit();
    http_response_code(200);
    echo json_encode(array("message" => "Participant added successfully.", "thread_id" => $thread_id, "user_added_id" => $user_id_to_add, "new_thread_type" => $new_thread_type ?: $thread['type']));

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
