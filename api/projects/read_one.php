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

$project_id = isset($_GET['id']) ? $_GET['id'] : die();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));

        // --- Get Project Base Details ---
        $query = "SELECT p.id, p.title, p.description, p.status, p.budget, p.deadline, c.name as clientName, f.name as freelancerName
                  FROM projects p
                  JOIN users c ON p.client_id = c.id
                  LEFT JOIN users f ON p.freelancer_id = f.id
                  WHERE p.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $project_id);
        $stmt->execute();
        $project = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project) {
            http_response_code(404);
            echo json_encode(array("message" => "Project not found."));
            return;
        }

        // --- Get Assignments & Tasks ---
        $assignments_query = "SELECT id, title FROM assignments WHERE project_id = :project_id";
        $assignments_stmt = $db->prepare($assignments_query);
        $assignments_stmt->bindParam(':project_id', $project_id);
        $assignments_stmt->execute();
        $assignments = $assignments_stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($assignments as $key => $assignment) {
            $tasks_query = "SELECT id, description, status FROM tasks WHERE assignment_id = :assignment_id";
            $tasks_stmt = $db->prepare($tasks_query);
            $tasks_stmt->bindParam(':assignment_id', $assignment['id']);
            $tasks_stmt->execute();
            $assignments[$key]['tasks'] = $tasks_stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $project['assignments'] = $assignments;

        // --- Get Files ---
        $files_query = "SELECT id, name, size, type, uploaded_at, uploader_id FROM files WHERE project_id = :project_id";
        $files_stmt = $db->prepare($files_query);
        $files_stmt->bindParam(':project_id', $project_id);
        $files_stmt->execute();
        $project['files'] = $files_stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($project);

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
