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

$project_id = isset($_GET['project_id']) ? $_GET['project_id'] : die();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $requesting_user_id = $decoded->data->id;
        $requesting_user_role = $decoded->data->role;

        // --- Permission Check: User must be part of the project ---
        $project_check_stmt = $db->prepare("SELECT client_id, freelancer_id FROM projects WHERE id = :project_id");
        $project_check_stmt->bindParam(':project_id', $project_id);
        $project_check_stmt->execute();
        $project_roles = $project_check_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project_roles) {
            http_response_code(404);
            echo json_encode(array("message" => "Project not found."));
            exit;
        }

        $is_project_member = (
            $requesting_user_role === 'admin' ||
            $requesting_user_id == $project_roles['client_id'] ||
            ($project_roles['freelancer_id'] && $requesting_user_id == $project_roles['freelancer_id'])
        );

        if (!$is_project_member) {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. You are not authorized to view files for this project."));
            exit;
        }
        // --- End Permission Check ---
        
        $query = "SELECT f.id, f.filename as name, f.path as path, f.file_size as size, f.mime_type as type, f.created_at as uploaded_at, u.name as uploader_name, u.id as uploader_id
                  FROM files f
                  JOIN users u ON f.uploaded_by = u.id
                  WHERE f.project_id = :project_id
                  ORDER BY f.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':project_id', $project_id);
        $stmt->execute();

        $files_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $file_item = array(
                "id" => $row['id'],
                "name" => $row['name'],
                "path" => $row['path'], // Sending path might be useful for constructing download links
                "size" => $row['size'],
                "type" => $row['type'],
                "uploaded_at" => $row['uploaded_at'],
                "uploader_name" => $row['uploader_name'],
                "uploader_id" => $row['uploader_id']
            );
            array_push($files_arr, $file_item);
        }

        http_response_code(200);
        echo json_encode($files_arr);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    } catch (Exception $e) {
        http_response_code(401); // For JWT errors
        echo json_encode(array("message" => "Access denied or error processing request.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
