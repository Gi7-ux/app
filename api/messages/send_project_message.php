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

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['project_id']) || !isset($data['text']) || !isset($data['thread_type'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required data: project_id, text, and thread_type are required."]);
    exit();
}

$project_id = (int)$data['project_id'];
$text = trim($data['text']);
$thread_type = $data['thread_type'];
$allowed_thread_types = ['project_client_admin_freelancer', 'project_admin_client', 'project_admin_freelancer'];

if (empty($text) || strlen($text) > 2000) {
    http_response_code(400);
    echo json_encode(["message" => "Message text cannot be empty or longer than 2000 characters."]);
    exit();
}
if (!in_array($thread_type, $allowed_thread_types)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid thread type specified."]);
    exit();
}

$db->beginTransaction();

try {
    // 1. Find or create the message thread
    $stmt = $db->prepare("SELECT id FROM message_threads WHERE project_id = :project_id AND type = :type");
    $stmt->bindParam(':project_id', $project_id);
    $stmt->bindParam(':type', $thread_type);
    $stmt->execute();
    $thread_id = $stmt->fetchColumn();

    if (!$thread_id) {
        // Create a new thread
        $stmt = $db->prepare("INSERT INTO message_threads (project_id, type, subject) VALUES (:project_id, :type, 'Project Communication')");
        $stmt->bindParam(':project_id', $project_id);
        $stmt->bindParam(':type', $thread_type);
        $stmt->execute();
        $thread_id = $db->lastInsertId();

        // 2. Add participants to the new thread based on type
        // Get project owner (client)
        $client_stmt = $db->prepare("SELECT client_id FROM projects WHERE id = :project_id");
        $client_stmt->bindParam(':project_id', $project_id);
        $client_stmt->execute();
        $client_id = $client_stmt->fetchColumn();

        // Get assigned freelancers
        $freelancer_stmt = $db->prepare("SELECT user_id FROM assignments WHERE project_id = :project_id");
        $freelancer_stmt->bindParam(':project_id', $project_id);
        $freelancer_stmt->execute();
        $freelancers = $freelancer_stmt->fetchAll(PDO::FETCH_COLUMN);

        // Get admins (you might have a better way to identify admins, e.g., a list or role query)
        $admin_stmt = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
        $admin_stmt->execute();
        $admins = $admin_stmt->fetchAll(PDO::FETCH_COLUMN);

        $participants = [];
        switch ($thread_type) {
            case 'project_client_admin_freelancer':
                $participants = array_merge($admins, $freelancers, [$client_id]);
                break;
            case 'project_admin_client':
                $participants = array_merge($admins, [$client_id]);
                break;
            case 'project_admin_freelancer':
                $participants = array_merge($admins, $freelancers);
                break;
        }
        $participants = array_unique($participants);

        $participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
        foreach ($participants as $p_id) {
            if ($p_id) {
                $participant_stmt->bindValue(':thread_id', $thread_id, PDO::PARAM_INT);
                $participant_stmt->bindValue(':user_id', $p_id, PDO::PARAM_INT);
                $participant_stmt->execute();
            }
        }
    }

    // 3. Determine message status based on user role and thread type
    $status = 'approved';
    if ($user_role === 'freelancer' && $thread_type === 'project_client_admin_freelancer') {
        $status = 'pending';
    }

    // 4. Insert the message
    $stmt = $db->prepare("INSERT INTO messages (thread_id, sender_id, text, status) VALUES (:thread_id, :sender_id, :text, :status)");
    $stmt->bindParam(':thread_id', $thread_id);
    $stmt->bindParam(':sender_id', $user_id);
    $stmt->bindParam(':text', $text);
    $stmt->bindParam(':status', $status);
    $stmt->execute();
    $message_id = $db->lastInsertId();

    // 5. Create notifications for other participants
    $participants_stmt = $db->prepare("SELECT user_id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id != :sender_id");
    $participants_stmt->bindParam(':thread_id', $thread_id);
    $participants_stmt->bindParam(':sender_id', $user_id);
    $participants_stmt->execute();

    $sender_name_stmt = $db->prepare("SELECT name FROM users WHERE id = :sender_id");
    $sender_name_stmt->bindParam(":sender_id", $user_id);
    $sender_name_stmt->execute();
    $sender_name = $sender_name_stmt->fetchColumn() ?: 'A user';

    $notification_text = "New message in project: " . ($status === 'pending' ? " (pending approval)" : "");
    $link = "/projects/{$project_id}?tab=messages&thread_id={$thread_id}";

    $notification_stmt = $db->prepare("INSERT INTO notifications (user_id, message, link, title) VALUES (:user_id, :message, :link, 'New Project Message')");

    while ($participant = $participants_stmt->fetch(PDO::FETCH_ASSOC)) {
        // In pending freelancer messages, only notify admins
        if ($status === 'pending') {
            $role_check = $db->prepare("SELECT role FROM users WHERE id = :user_id");
            $role_check->bindParam(':user_id', $participant['user_id']);
            $role_check->execute();
            $participant_role = $role_check->fetchColumn();
            if ($participant_role !== 'admin') {
                continue; // Skip non-admins for pending messages
            }
        }
        $notification_stmt->bindParam(':user_id', $participant['user_id']);
        $notification_stmt->bindParam(':message', "{$sender_name} sent: \"{$text}\"{$notification_text}");
        $notification_stmt->bindParam(':link', $link);
        $notification_stmt->execute();
    }


    $db->commit();
    http_response_code(201);
    echo json_encode(["message" => "Message sent successfully.", "message_id" => $message_id, "status" => $status]);

} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    error_log("Send message failed: " . $e->getMessage());
    echo json_encode(["message" => "Failed to send message: Database error.", "error" => $e->getMessage()]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    error_log("Send message failed: " . $e->getMessage());
    echo json_encode(["message" => "An unexpected error occurred.", "error" => $e->getMessage()]);
}
?>
