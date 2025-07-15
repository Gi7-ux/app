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

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
if ($limit < 1 || $limit > 50) $limit = 5;

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;
        $role = $decoded->data->role;

        $query = '';
        $params = [];
        if ($role === 'admin') {
            $query = "SELECT f.id, f.filename, f.path, f.file_size, f.mime_type, f.created_at, u.name as uploaded_by, p.title as project
                      FROM files f
                      JOIN users u ON f.uploaded_by = u.id
                      JOIN projects p ON f.project_id = p.id
                      ORDER BY f.created_at DESC
                      LIMIT :limit";
        } else if ($role === 'client') {
            $query = "SELECT f.id, f.filename, f.path, f.file_size, f.mime_type, f.created_at, u.name as uploaded_by, p.title as project
                      FROM files f
                      JOIN users u ON f.uploaded_by = u.id
                      JOIN projects p ON f.project_id = p.id
                      WHERE p.client_id = :user_id
                      ORDER BY f.created_at DESC
                      LIMIT :limit";
            $params[':user_id'] = $user_id;
        } else if ($role === 'freelancer') {
            $query = "SELECT f.id, f.filename, f.path, f.file_size, f.mime_type, f.created_at, u.name as uploaded_by, p.title as project
                      FROM files f
                      JOIN users u ON f.uploaded_by = u.id
                      JOIN projects p ON f.project_id = p.id
                      WHERE p.freelancer_id = :user_id
                      ORDER BY f.created_at DESC
                      LIMIT :limit";
            $params[':user_id'] = $user_id;
        } else {
            http_response_code(403);
            echo json_encode(["message" => "Access denied."]);
            exit;
        }

        $stmt = $db->prepare($query);
        if (isset($params[':user_id'])) {
            $stmt->bindParam(':user_id', $params[':user_id']);
        }
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($files);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied.", "error" => $e->getMessage()]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. No token provided."]);
}
