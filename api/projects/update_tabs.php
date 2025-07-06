<?php
// api/projects/update_tabs.php

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;
        $is_admin = ($decoded->data->role === 'admin');

        // Validate required fields
        if (
            empty($data->id) ||
            empty($data->title) || 
            empty($data->description)
        ) {
            http_response_code(400);
            echo json_encode([
                "message" => "Project update failed. Required fields are missing."
            ]);
            exit();
        }

        // Prepare query - admin can update all projects, regular users only their own
        $sql = "UPDATE projects 
                SET 
                    title = :title,
                    description = :description,
                    budget = :budget,
                    deadline = :deadline,
                    status = :status
                WHERE 
                    id = :id";
                    
        // If not admin, ensure user can only update their projects
        if (!$is_admin) {
            $sql .= " AND (client_id = :user_id OR freelancer_id = :user_id)";
        }

        // Prepare statement
        $stmt = $db->prepare($sql);

        // Bind values
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":budget", $data->budget);
        $stmt->bindParam(":deadline", $data->deadline);
        $stmt->bindParam(":status", $data->status);

        if (!$is_admin) {
            $stmt->bindParam(":user_id", $user_id);
        }

        // Execute query
        if ($stmt->execute()) {
            // Update was successful, now get the updated project data to return
            $sql = "SELECT 
                        p.*,
                        c.email as clientName,
                        CASE WHEN f.id IS NULL THEN 'Unassigned' ELSE f.email END as freelancerName,
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
                        p.id = :id
                    GROUP BY 
                        p.id";
            
            $stmt = $db->prepare($sql);
            $stmt->bindParam(":id", $data->id);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Check if the project_skills table and column exists before querying
                try {
                    $check_table_query = "SHOW TABLES LIKE 'project_skills'";
                    $check_table_stmt = $db->prepare($check_table_query);
                    $check_table_stmt->execute();
                    
                    $skills = [];
                    if ($check_table_stmt->rowCount() > 0) {
                        // Table exists, check if the column exists
                        $check_column_query = "SHOW COLUMNS FROM project_skills LIKE 'skill_name'";
                        $check_column_stmt = $db->prepare($check_column_query);
                        $check_column_stmt->execute();
                        
                        if ($check_column_stmt->rowCount() > 0) {
                            // Column exists, proceed with query
                            $skills_query = "SELECT skill_name FROM project_skills WHERE project_id = ?";
                            $skills_stmt = $db->prepare($skills_query);
                            $skills_stmt->execute([$data->id]);
                            
                            while ($skill_row = $skills_stmt->fetch(PDO::FETCH_ASSOC)) {
                                $skills[] = $skill_row['skill_name'];
                            }
                        }
                    }
                    $row['skills'] = $skills;
                } catch (PDOException $e) {
                    // If there's any error, just set an empty skills array
                    $row['skills'] = [];
                    file_put_contents('../logs/debug.log', "Skills query error: " . $e->getMessage() . "\n", FILE_APPEND);
                }
                
                // Get assignments with error handling
                try {
                    // First, check if the assignments table exists
                    $check_table_query = "SHOW TABLES LIKE 'assignments'";
                    $check_table_stmt = $db->prepare($check_table_query);
                    $check_table_stmt->execute();
                    
                    $assignments = [];
                    if ($check_table_stmt->rowCount() > 0) {
                        // Check if the assignments table has a title column
                        $check_column_query = "SHOW COLUMNS FROM assignments LIKE 'title'";
                        $check_column_stmt = $db->prepare($check_column_query);
                        $check_column_stmt->execute();
                        
                        if ($check_column_stmt->rowCount() > 0) {
                            // Column exists, use it in query
                            $assignments_query = "SELECT id, title, project_id, user_id, assigned_at FROM assignments WHERE project_id = ?";
                        } else {
                            // Column doesn't exist, get basic fields
                            $assignments_query = "SELECT id, project_id, user_id, assigned_at FROM assignments WHERE project_id = ?";
                        }
                        
                        $assignments_stmt = $db->prepare($assignments_query);
                        $assignments_stmt->execute([$data->id]);
                        
                        while ($assignment_row = $assignments_stmt->fetch(PDO::FETCH_ASSOC)) {
                            // If title doesn't exist, provide a default
                            if (!isset($assignment_row['title'])) {
                                $assignment_row['title'] = "Task #" . $assignment_row['id'];
                            }
                            $assignments[] = $assignment_row;
                        }
                    }
                    $row['assignments'] = $assignments;
                } catch (PDOException $e) {
                    // If there's any error, just set an empty assignments array
                    $row['assignments'] = [];
                    file_put_contents('../logs/debug.log', "Assignments query error: " . $e->getMessage() . "\n", FILE_APPEND);
                }
                
                http_response_code(200);
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode([
                    "message" => "Project not found after update."
                ]);
            }
        } else {
            http_response_code(503);
            echo json_encode([
                "message" => "Unable to update project."
            ]);
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array(
            "message" => "Access denied.",
            "error" => $e->getMessage()
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
