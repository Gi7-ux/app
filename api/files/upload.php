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

        if (isset($_FILES['file']) && isset($_POST['project_id'])) {
            $project_id = $_POST['project_id'];
            $file = $_FILES['file'];

            $upload_dir = '../uploads/';
            $file_name = basename($file['name']);
            $target_file = $upload_dir . $file_name;
            $file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

            // Check if file already exists
            if (file_exists($target_file)) {
                http_response_code(400);
                echo json_encode(array("message" => "File already exists."));
                return;
            }

            // Check file size (e.g., 500MB limit)
            if ($file['size'] > 500 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(array("message" => "File is too large. Max size is 500MB."));
                return;
            }

            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $query = "INSERT INTO files SET project_id=:project_id, uploader_id=:uploader_id, name=:name, path=:path, size=:size, type=:type";
                $stmt = $db->prepare($query);

                $stmt->bindParam(':project_id', $project_id);
                $stmt->bindParam(':uploader_id', $user_id);
                $stmt->bindParam(':name', $file_name);
                $stmt->bindParam(':path', $target_file);
                $stmt->bindParam(':size', $file['size']);
                $stmt->bindParam(':type', $file_type);

                if ($stmt->execute()) {
                    http_response_code(201);
                    echo json_encode(array("message" => "File uploaded successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Failed to save file info to database."));
                }
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Failed to upload file."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "File or project ID is missing."));
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
