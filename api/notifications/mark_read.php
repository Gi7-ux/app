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

        // Mark a specific notification as read, or all if no ID is provided
        $query = "UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id";
        if (!empty($data->notification_id)) {
            $query .= " AND id = :notification_id";
        }
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        if (!empty($data->notification_id)) {
            $stmt->bindParam(':notification_id', $data->notification_id);
        }

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Notification(s) marked as read."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to mark notification(s) as read."));
        }

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
