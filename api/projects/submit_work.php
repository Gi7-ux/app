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

        if (isset($_FILES['proof']) && isset($_POST['time_log_id']) && isset($_POST['comment'])) {
            $time_log_id = $_POST['time_log_id'];
            $comment = $_POST['comment'];
            $file = $_FILES['proof'];

            $upload_dir = '../uploads/proof_of_work/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            $file_name = $time_log_id . '_' . basename($file['name']);
            $target_file = $upload_dir . $file_name;

            if (move_uploaded_file($file['tmp_name'], $target_file)) {
                $query = "INSERT INTO work_submissions SET time_log_id=:time_log_id, file_path=:file_path, comment=:comment";
                $stmt = $db->prepare($query);

                $stmt->bindParam(':time_log_id', $time_log_id);
                $stmt->bindParam(':file_path', $target_file);
                $stmt->bindParam(':comment', $comment);

                if ($stmt->execute()) {
                    http_response_code(201);
                    echo json_encode(array("message" => "Work submitted successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Failed to save submission to database."));
                }
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Failed to upload proof of work."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Proof of work file, time log ID, or comment is missing."));
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
