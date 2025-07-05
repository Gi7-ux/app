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

        if ($decoded->data->role !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied."));
            return;
        }

        if (!empty($data->file_id)) {
            // First, get the file path to delete the physical file
            $path_stmt = $db->prepare("SELECT path FROM files WHERE id = :file_id");
            $path_stmt->bindParam(':file_id', $data->file_id);
            $path_stmt->execute();
            $file_path = $path_stmt->fetchColumn();

            if ($file_path && file_exists($file_path)) {
                unlink($file_path); // Delete the physical file
            }

            // Then, delete the database record
            $query = "DELETE FROM files WHERE id = :file_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':file_id', $data->file_id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "File was deleted."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete file record."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete file. ID is missing."));
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
