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
        $user_id = $decoded->data->id;
        $user_role = $decoded->data->role;

        if (!empty($data->thread_id) && !empty($data->text)) {
            // Verify user is a participant
            $verify_stmt = $db->prepare("SELECT * FROM message_thread_participants WHERE thread_id = :thread_id AND user_id = :user_id");
            $verify_stmt->bindParam(':thread_id', $data->thread_id);
            $verify_stmt->bindParam(':user_id', $user_id);
            $verify_stmt->execute();

            if ($verify_stmt->rowCount() == 0) {
                http_response_code(403);
                echo json_encode(array("message" => "Access denied. You are not a participant of this thread."));
                return;
            }
            
            // Determine message status
            $thread_type_stmt = $db->prepare("SELECT type FROM message_threads WHERE id = :thread_id");
            $thread_type_stmt->bindParam(':thread_id', $data->thread_id);
            $thread_type_stmt->execute();
            $thread_type = $thread_type_stmt->fetchColumn();

            $status = 'approved';
            if ($user_role === 'freelancer' && $thread_type === 'project_client_admin_freelancer') {
                $status = 'pending';
            }

            $query = "INSERT INTO messages SET thread_id=:thread_id, sender_id=:sender_id, text=:text, status=:status";
            $stmt = $db->prepare($query);

            $stmt->bindParam(":thread_id", $data->thread_id);
            $stmt->bindParam(":sender_id", $user_id);
            $stmt->bindParam(":text", $data->text);
            $stmt->bindParam(":status", $status);

            if ($stmt->execute()) {
                // Create notifications for all other participants in the thread
                $participants_stmt = $db->prepare("SELECT user_id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id != :sender_id");
                $participants_stmt->bindParam(':thread_id', $data->thread_id);
                $participants_stmt->bindParam(':sender_id', $user_id);
                $participants_stmt->execute();
                
                $notification_query = "INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)";
                $notification_stmt = $db->prepare($notification_query);
                
                $sender_name = $decoded->data->name;
                $message = "New message from {$sender_name} in thread."; // Simple message for now
                $link = "/messages"; // Generic link

                while ($participant = $participants_stmt->fetch(PDO::FETCH_ASSOC)) {
                    $notification_stmt->bindParam(':user_id', $participant['user_id']);
                    $notification_stmt->bindParam(':message', $message);
                    $notification_stmt->bindParam(':link', $link);
                    $notification_stmt->execute();
                }

                http_response_code(201);
                echo json_encode(array("message" => "Message sent."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to send message."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to send message. Data is incomplete."));
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array(
            "message" => "Access denied.",
            "error" => $e->getMessage()
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
