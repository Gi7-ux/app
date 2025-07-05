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
if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;
        $user_role = $decoded->data->role;

        $stats = [];

        if ($user_role === 'admin') {
            $stmt_users = $db->query("SELECT COUNT(*) as total FROM users");
            $stats['total_users'] = $stmt_users->fetchColumn();

            $stmt_projects = $db->query("SELECT COUNT(*) as total FROM projects");
            $stats['total_projects'] = $stmt_projects->fetchColumn();
            
            $stmt_progress = $db->query("SELECT COUNT(*) as total FROM projects WHERE status = 'In Progress'");
            $stats['projects_in_progress'] = $stmt_progress->fetchColumn();
            
            // Mocked for now as we don't have this data yet
            $stats['messages_pending_approval'] = 2; 
            $stats['projects_pending_approval'] = 1;

        } elseif ($user_role === 'client') {
            $stmt_total = $db->prepare("SELECT COUNT(*) as total FROM projects WHERE client_id = :user_id");
            $stmt_total->bindParam(':user_id', $user_id);
            $stmt_total->execute();
            $stats['total_projects'] = $stmt_total->fetchColumn();
            
            $stmt_open = $db->prepare("SELECT COUNT(*) as total FROM projects WHERE client_id = :user_id AND (status = 'Open' OR status = 'Pending Approval')");
            $stmt_open->bindParam(':user_id', $user_id);
            $stmt_open->execute();
            $stats['projects_awaiting'] = $stmt_open->fetchColumn();

            $stmt_progress = $db->prepare("SELECT COUNT(*) as total FROM projects WHERE client_id = :user_id AND status = 'In Progress'");
            $stmt_progress->bindParam(':user_id', $user_id);
            $stmt_progress->execute();
            $stats['projects_in_progress'] = $stmt_progress->fetchColumn();

            $stmt_completed = $db->prepare("SELECT COUNT(*) as total FROM projects WHERE client_id = :user_id AND status = 'Completed'");
            $stmt_completed->bindParam(':user_id', $user_id);
            $stmt_completed->execute();
            $stats['projects_completed'] = $stmt_completed->fetchColumn();

        } elseif ($user_role === 'freelancer') {
            $stmt_open = $db->query("SELECT COUNT(*) as total FROM projects WHERE status = 'Open'");
            $stats['open_projects'] = $stmt_open->fetchColumn();

            $stmt_assigned = $db->prepare("SELECT COUNT(*) as total FROM projects WHERE freelancer_id = :user_id");
            $stmt_assigned->bindParam(':user_id', $user_id);
            $stmt_assigned->execute();
            $stats['assigned_projects'] = $stmt_assigned->fetchColumn();
            
            // Mocked for now
            $stats['my_applications'] = 2;
            $stats['tasks_in_progress'] = 1;
        }

        http_response_code(200);
        echo json_encode($stats);

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
