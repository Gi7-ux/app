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
        // Added p.spend, p.purchased_hours, p.hours_spent
        $query = "SELECT
                    p.id, p.title, p.description, p.status, p.budget, p.deadline,
                    p.spend, p.purchased_hours, p.hours_spent,
                    c.name as clientName, f.name as freelancerName
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

        // Ensure numeric values are correctly typed (or default if null)
        $project['budget'] = $project['budget'] ? (float)$project['budget'] : 0;
        $project['spend'] = $project['spend'] ? (float)$project['spend'] : 0;
        $project['purchased_hours'] = $project['purchased_hours'] ? (float)$project['purchased_hours'] : 0;
        $project['hours_spent'] = $project['hours_spent'] ? (float)$project['hours_spent'] : 0;


        // --- Get Assignments & Tasks ---
        // Added assigned_to_id and user's name for assigned_to_name
        $assignments_query = "SELECT id, title FROM assignments WHERE project_id = :project_id";
        $assignments_stmt = $db->prepare($assignments_query);
        $assignments_stmt->bindParam(':project_id', $project_id);
        $assignments_stmt->execute();
        $assignments = $assignments_stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($assignments as $key => $assignment) {
            $tasks_query = "SELECT t.id, t.description, t.status, t.assigned_to_id, u_task.name as assigned_to_name
                            FROM tasks t
                            LEFT JOIN users u_task ON t.assigned_to_id = u_task.id
                            WHERE t.assignment_id = :assignment_id";
            $tasks_stmt = $db->prepare($tasks_query);
            $tasks_stmt->bindParam(':assignment_id', $assignment['id']);
            $tasks_stmt->execute();
            $tasks_for_assignment = $tasks_stmt->fetchAll(PDO::FETCH_ASSOC);
            // Ensure assigned_to_name is null if assigned_to_id is null
            foreach ($tasks_for_assignment as $task_key => $task_value) {
                if ($task_value['assigned_to_id'] === null) {
                    $tasks_for_assignment[$task_key]['assigned_to_name'] = null;
                }
            }
            $assignments[$key]['tasks'] = $tasks_for_assignment;
        }
        $project['assignments'] = $assignments;

        // --- Get Files ---
        // Assuming files table has uploader_id linking to users table for uploader_name
        $files_query = "SELECT f.id, f.name, f.size, f.type, f.uploaded_at, f.project_id, u_file.name as uploader_name
                        FROM files f
                        LEFT JOIN users u_file ON f.uploader_id = u_file.id
                        WHERE f.project_id = :project_id";
        $files_stmt = $db->prepare($files_query);
        $files_stmt->bindParam(':project_id', $project_id);
        $files_stmt->execute();
        $project['files'] = $files_stmt->fetchAll(PDO::FETCH_ASSOC);

        // --- Get Project Messages ---
        // Assumes a table 'project_messages' with 'project_id', 'user_id', 'message_text', 'created_at'
        // and a 'users' table with 'id', 'name' for sender's name
        $messages_query = "SELECT pm.id, pm.project_id, pm.user_id, u.name as sender_name, pm.message_text, pm.created_at
                           FROM project_messages pm
                           JOIN users u ON pm.user_id = u.id
                           WHERE pm.project_id = :project_id
                           ORDER BY pm.created_at ASC";
        $messages_stmt = $db->prepare($messages_query);
        $messages_stmt->bindParam(':project_id', $project_id);
        $messages_stmt->execute();
        $project['messages'] = $messages_stmt->fetchAll(PDO::FETCH_ASSOC);

        // --- Get Project Skills ---
        $skills_query = "SELECT skill_name FROM project_skills WHERE project_id = :project_id ORDER BY skill_name";
        $skills_stmt = $db->prepare($skills_query);
        $skills_stmt->bindParam(':project_id', $project_id);
        $skills_stmt->execute();
        // Fetch as a simple array of skill names
        $project['skills'] = $skills_stmt->fetchAll(PDO::FETCH_COLUMN, 0);


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
