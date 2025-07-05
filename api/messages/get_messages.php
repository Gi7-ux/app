<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$thread_id = isset($_GET['thread_id']) ? $_GET['thread_id'] : die();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;
        $user_role = $decoded->data->role;

        // First, verify the user is a participant of this thread
        $verify_stmt = $db->prepare("SELECT * FROM message_thread_participants WHERE thread_id = :thread_id AND user_id = :user_id");
        $verify_stmt->bindParam(':thread_id', $thread_id);
        $verify_stmt->bindParam(':user_id', $user_id);
        $verify_stmt->execute();

        if ($verify_stmt->rowCount() == 0) {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. You are not a participant of this thread."));
            return;
        }

        // Base query
        $query = "SELECT m.id, m.sender_id, m.text, m.timestamp, m.status, u.name as sender_name 
                  FROM messages m 
                  JOIN users u ON m.sender_id = u.id 
                  WHERE m.thread_id = :thread_id";

        // Apply visibility rules
        if ($user_role !== 'admin') {
            $query .= " AND (m.status = 'approved' OR m.sender_id = :user_id)";
        }
        
        $query .= " ORDER BY m.timestamp ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':thread_id', $thread_id);
        if ($user_role !== 'admin') {
            $stmt->bindParam(':user_id', $user_id);
        }
        $stmt->execute();

        $messages_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $message_item = array(
                "id" => $id,
                "sender" => $sender_name,
                "text" => $text,
                "timestamp" => $timestamp,
                "status" => $status
            );
            array_push($messages_arr, $message_item);
        }

        http_response_code(200);
        echo json_encode($messages_arr);

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
