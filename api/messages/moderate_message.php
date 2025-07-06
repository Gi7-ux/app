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

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        
        $admin_user_id = $decoded->data->id; // Get admin user ID for potential logging or notifications
        $user_role = $decoded->data->role;

        if ($user_role !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. Only admins can moderate messages."));
            exit;
        }

        $message_id = $data->message_id ?? null;
        $new_status = $data->status ?? null; // Expect 'approved' or 'deleted' (or 'rejected' if we map it)

        // Aligning with schema: 'approved', 'pending', 'deleted'. Admin actions: 'approve', 'delete'.
        $allowed_statuses = ['approved', 'deleted'];
        // 'rejected' can be mapped to 'deleted' or a new status if needed. For now, let's use 'deleted'.
        if ($new_status === 'rejected') {
            $new_status = 'deleted';
        }

        if (empty($message_id) || empty($new_status) || !in_array($new_status, $allowed_statuses)) {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update status. Data is incomplete or status is invalid. Allowed statuses: 'approved', 'deleted' (or 'rejected' which maps to 'deleted')."));
            exit;
        }

        // Fetch current message details to check original status and sender
        $msg_check_stmt = $db->prepare("SELECT sender_id, status, text, thread_id FROM messages WHERE id = :message_id");
        $msg_check_stmt->bindParam(':message_id', $message_id);
        $msg_check_stmt->execute();
        $message_details = $msg_check_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$message_details) {
            http_response_code(404);
            echo json_encode(array("message" => "Message not found."));
            exit;
        }

        if ($message_details['status'] === $new_status) {
            http_response_code(200); // Or 304 Not Modified
            echo json_encode(array("message" => "Message status is already " . $new_status . ". No change made."));
            exit;
        }

        // Only 'pending' messages can be 'approved'. Any message can be 'deleted' by an admin.
        if ($new_status === 'approved' && $message_details['status'] !== 'pending') {
            http_response_code(400);
            echo json_encode(array("message" => "Only 'pending' messages can be approved. This message is currently '{$message_details['status']}'."));
            exit;
        }


        $query = "UPDATE messages SET status = :status WHERE id = :message_id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':status', $new_status);
        $stmt->bindParam(':message_id', $message_id);

        if ($stmt->execute()) {
            // Notification to sender if message is rejected/deleted
            if ($new_status === 'deleted' && $message_details['sender_id'] != $admin_user_id) {
                $sender_id = $message_details['sender_id'];
                $message_text_preview = substr($message_details['text'], 0, 30) . "...";

                $thread_info_stmt = $db->prepare("SELECT project_id FROM message_threads WHERE id = :thread_id");
                $thread_info_stmt->bindParam(":thread_id", $message_details['thread_id']);
                $thread_info_stmt->execute();
                $thread_project_id = $thread_info_stmt->fetchColumn();

                $notification_text = "Your message \"{$message_text_preview}\" has been reviewed by an admin and was not approved.";
                $link = $thread_project_id ? "/projects/{$thread_project_id}?tab=messages" : "/messages?thread_id={$message_details['thread_id']}";

                $notify_stmt = $db->prepare("INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)");
                $notify_stmt->bindParam(':user_id', $sender_id);
                $notify_stmt->bindParam(':message', $notification_text);
                $notify_stmt->bindParam(':link', $link);
                $notify_stmt->execute();
            }
            // Potentially notify other participants if a pending message becomes approved
            if ($new_status === 'approved' && $message_details['status'] === 'pending') {
                // This logic is similar to send_message, create notifications for other participants
                $sender_name_stmt = $db->prepare("SELECT name FROM users WHERE id = :sender_id");
                $sender_name_stmt->bindParam(":sender_id", $message_details['sender_id']);
                $sender_name_stmt->execute();
                $sender_name = $sender_name_stmt->fetchColumn() ?: 'A user';

                $participants_stmt = $db->prepare("SELECT user_id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id != :sender_id");
                $participants_stmt->bindParam(':thread_id', $message_details['thread_id']);
                $participants_stmt->bindParam(':sender_id', $message_details['sender_id']);
                $participants_stmt->execute();

                $notification_query = "INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)";
                $notification_stmt = $db->prepare($notification_query);

                $message_preview = substr($message_details['text'], 0, 50) . (strlen($message_details['text']) > 50 ? "..." : "");
                $approved_message_notification = "A new message from {$sender_name} has been approved: \"{$message_preview}\"";

                $thread_info_stmt = $db->prepare("SELECT project_id FROM message_threads WHERE id = :thread_id");
                $thread_info_stmt->bindParam(":thread_id", $message_details['thread_id']);
                $thread_info_stmt->execute();
                $thread_project_id = $thread_info_stmt->fetchColumn();
                $link = $thread_project_id ? "/projects/{$thread_project_id}?tab=messages" : "/messages?thread_id={$message_details['thread_id']}";

                while ($participant = $participants_stmt->fetch(PDO::FETCH_ASSOC)) {
                    // Avoid notifying the admin who just performed the action if they are also a "participant" in that sense
                    if ($participant['user_id'] == $admin_user_id && $message_details['sender_id'] != $admin_user_id) continue;

                    $notification_stmt->bindParam(':user_id', $participant['user_id']);
                    $notification_stmt->bindParam(':message', $approved_message_notification);
                    $notification_stmt->bindParam(':link', $link);
                    $notification_stmt->execute();
                }
            }

            http_response_code(200);
            echo json_encode(array("message" => "Message status updated to " . $new_status . "."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update message status."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    } catch (Exception $e) {
        http_response_code(401); // Catching JWT decode errors or others
        echo json_encode(array(
            "message" => "Access denied or error processing request.",
            "error" => $e->getMessage()
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
