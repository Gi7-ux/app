<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';
require_once '../migrations/run_migrations.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Initialize database connection
try {
    $database = new Database();
    $db = $database->connect();
} catch (PDOException $e) {
    file_put_contents('../logs/debug.log', "Database Connection Error: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed.", "error" => $e->getMessage()));
    exit();
}

// Validate project ID
$project_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if (!$project_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid project ID."));
    exit();
}

// Log Authorization header for debugging
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
file_put_contents('../logs/debug.log', "Read Script Start\nAuthorization Header: {$authHeader}\n", FILE_APPEND);

// Parse the Authorization header to extract the token
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        // Add detailed JWT debugging
        
        // Try to decode the JWT
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));

        // Debug: Get users table structure
        try {
            $debug_stmt = $db->prepare("DESCRIBE users");
            $debug_stmt->execute();
            $columns = $debug_stmt->fetchAll(PDO::FETCH_ASSOC);
            file_put_contents('../logs/debug.log', "Users Table Columns: " . print_r($columns, true) . "\n", FILE_APPEND);
        } catch (PDOException $e) {
            file_put_contents('../logs/debug.log', "Debug Query Error: " . $e->getMessage() . "\n", FILE_APPEND);
        }

        // --- Get Project Base Details ---
        // Use a more limited set of columns to avoid any potential issues
        $query = "SELECT 
                  p.id, 
                  p.title, 
                  p.description, 
                  p.status, 
                  p.budget, 
                  p.deadline, 
                  p.created_at,
                  IFNULL(c.name, c.email) as clientName,
                  CASE WHEN f.id IS NULL THEN 'Unassigned' ELSE IFNULL(f.name, f.email) END as freelancerName
                  FROM projects p
                  JOIN users c ON p.client_id = c.id
                  LEFT JOIN users f ON p.freelancer_id = f.id
                  WHERE p.id = :id";
        try {
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $project_id);
            $stmt->execute();
            $project = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            file_put_contents('../logs/debug.log', "SQL Error: " . $e->getMessage() . "\nQuery: " . $query . "\n", FILE_APPEND);
            http_response_code(500);
            echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
            return;
        }

        if (!$project) {
            http_response_code(404);
            echo json_encode(array("message" => "Project not found."));
            return;
        }

        // --- Get Assignments & Tasks ---
        $assignments_query = "SELECT id, title FROM assignments WHERE project_id = :project_id";
        try {
            $assignments_stmt = $db->prepare($assignments_query);
            $assignments_stmt->bindParam(':project_id', $project_id);
            $assignments_stmt->execute();
            $assignments = $assignments_stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            file_put_contents('../logs/debug.log', "Assignments SQL Error: " . $e->getMessage() . "\nQuery: " . $assignments_query . "\n", FILE_APPEND);
            $assignments = []; // Set empty array on error instead of failing
        }

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
        file_put_contents('../logs/debug.log', "JWT Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", FILE_APPEND);
        http_response_code(401);
        echo json_encode(array(
            "message" => "Access denied.", 
            "error" => $e->getMessage(),
            "errorType" => get_class($e)
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
