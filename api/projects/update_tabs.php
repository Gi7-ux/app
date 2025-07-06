<?php
// api/projects/update_tabs.php

// Required headers
// Set CORS headers based on allowed origins
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    $allowed_origins = unserialize(ALLOWED_ORIGINS);
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
    }
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/utils.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Database connection
$database = new Database();
$db = $database->connect();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Token validation
function validate_token() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied. Authorization header not found."));
        exit();
    }

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied. Invalid Authorization header format."));
        exit();
    }

    $jwt = $matches[1];

    if (empty($jwt)) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied. Token not found."));
        exit();
    }

    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        return $decoded->data;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
        exit();
    }
}

// Validate and update project
function updateProject($db, $data, $user_id, $is_admin) {
    try {
        if (empty($data->id) || empty($data->title) || empty($data->description)) {
            http_response_code(400);
            echo json_encode(array("message" => "Project update failed. Required fields are missing."));
            exit();
        }

        $sql = "UPDATE projects 
                SET 
                    title = :title,
                    description = :description,
                    budget = :budget,
                    deadline = :deadline,
                    status = :status
                WHERE 
                    id = :id";

        if (!$is_admin) {
            $sql .= " AND (client_id = :user_id OR freelancer_id = :user_id)";
        }

        $stmt = $db->prepare($sql);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":budget", $data->budget);
        $stmt->bindParam(":deadline", $data->deadline);
        $stmt->bindParam(":status", $data->status);

        if (!$is_admin) {
            $stmt->bindParam(":user_id", $user_id);
        }

        if ($stmt->execute()) {
            return true;  // Successful update
        } else {
            throw new Exception("Unable to update project.");
        }
    } catch (\Throwable $e) {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update project.", "error" => $e->getMessage()));
        exit();
    }
    return false;
}

// Fetch project details including client and freelancer info
function fetchProjectDetails($db, $projectId) {
    $sql = "SELECT 
                p.*,
                c.email as clientEmail,
                CASE WHEN f.id IS NULL THEN 'Unassigned' ELSE f.email END as freelancerEmail,
                COALESCE(SUM(tl.hours), 0) as total_hours_logged,
                COALESCE(SUM(tl.hours * f.rate), 0) as spend
            FROM 
                projects p
            LEFT JOIN 
                users c ON p.client_id = c.id
            LEFT JOIN 
                users f ON p.freelancer_id = f.id
            LEFT JOIN 
                time_logs tl ON p.id = tl.project_id
            WHERE 
                p.id = :projectId
            GROUP BY 
                p.id";

    $stmt = $db->prepare($sql);
    $stmt->bindParam(":projectId", $projectId);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Project not found after update."));
        exit();
    }
}

// Fetch skills associated with the project
function fetchProjectSkills($db, $projectId) {
    $skills = [];

    if (table_exists($db, 'project_skills') && column_exists($db, 'project_skills', 'skill_name')) {
        $skills_query = "SELECT skill_name FROM project_skills WHERE project_id = :projectId";
        $skills_stmt = $db->prepare($skills_query);
        $skills_stmt->bindParam(":projectId", $projectId);
        $skills_stmt->execute();

        while ($skill_row = $skills_stmt->fetch(PDO::FETCH_ASSOC)) {
            $skills[] = $skill_row['skill_name'];
        }
    }

    return $skills;
}

// Fetch assignments for the project
function fetchAssignments($db, $projectId) {
    $assignments = [];

    if (table_exists($db, 'assignments')) {
        $columns_sql = "SHOW COLUMNS FROM assignments";
        $columns_stmt = $db->query($columns_sql);
        $columns = $columns_stmt->fetchAll(PDO::FETCH_COLUMN);

        if (in_array('title', $columns)) {
            $assignments_query = "SELECT id, title, project_id, user_id, assigned_at FROM assignments WHERE project_id = :projectId";
        } else {
            $assignments_query = "SELECT id, project_id, user_id, assigned_at FROM assignments WHERE project_id = :projectId";
        }

        $assignments_stmt = $db->prepare($assignments_query);
        $assignments_stmt->bindParam(":projectId", $projectId);
        $assignments_stmt->execute();

        while ($assignment_row = $assignments_stmt->fetch(PDO::FETCH_ASSOC)) {
            $assignments[] = $assignment_row;
        }
    }

    return $assignments;
}

// Ensure all data is correctly fetched and returned
function collectResult($db, $projectId) {
    try {
        $project = fetchProjectDetails($db, $projectId);
        $project['skills'] = fetchProjectSkills($db, $projectId);
        $project['assignments'] = fetchAssignments($db, $projectId);

        http_response_code(200);
        echo json_encode($project);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to collect project details.", "error" => $e->getMessage()));
    }
}

// Main workflow
try {
    $decoded_data = validate_token();
    if (updateProject($db, $data, $decoded_data->id, isset($decoded_data->role) && $decoded_data->role === 'admin')) {
        collectResult($db, $data->id);
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Failed to process request.", "error" => $e->getMessage()));
}
?>
