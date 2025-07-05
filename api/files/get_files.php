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
        
        $query = "SELECT f.id, f.name, f.size, f.type, f.uploaded_at, u.name as uploader 
                  FROM files f
                  JOIN users u ON f.uploader_id = u.id
                  WHERE f.project_id = :project_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':project_id', $project_id);
        $stmt->execute();

        $files_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $file_item = array(
                "id" => $id,
                "name" => $name,
                "size" => $size,
                "type" => $type,
                "uploadedAt" => $uploaded_at,
                "uploader" => $uploader
            );
            array_push($files_arr, $file_item);
        }

        http_response_code(200);
        echo json_encode($files_arr);

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
