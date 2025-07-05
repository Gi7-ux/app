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

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;

        if (isset($_FILES['avatar'])) {
            $file = $_FILES['avatar'];
            $upload_dir = '../uploads/avatars/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            $file_name = $user_id . '_' . basename($file['name']);
            $target_file = $upload_dir . $file_name;
            $file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

            // Check if image file is a actual image or fake image
            $check = getimagesize($file["tmp_name"]);
            if($check === false) {
                http_response_code(400);
                echo json_encode(array("message" => "File is not an image."));
                return;
            }

            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $query = "UPDATE users SET avatar = :avatar WHERE id = :id";
                $stmt = $db->prepare($query);
                $avatar_path = '/api/uploads/avatars/' . $file_name;
                $stmt->bindParam(':avatar', $avatar_path);
                $stmt->bindParam(':id', $user_id);

                if ($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Avatar updated successfully.", "avatar" => $avatar_path));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Failed to update avatar in database."));
                }
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Failed to upload avatar."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "No avatar file provided."));
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
