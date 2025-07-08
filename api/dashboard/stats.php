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
            
            // Actual count for messages pending approval (example, assuming a 'status' column in 'messages' table)
            // This requires the messages table to have a status like 'pending'
            $stmt_msg_approval = $db->query("SELECT COUNT(*) as total FROM messages WHERE status = 'pending'");
            $stats['messages_pending_approval'] = $stmt_msg_approval->fetchColumn();

            // Actual count for projects pending approval
            $stmt_proj_approval = $db->query("SELECT COUNT(*) as total FROM projects WHERE status = 'Pending Approval'");
            $stats['projects_pending_approval'] = $stmt_proj_approval->fetchColumn();
             // If zero, let's mock one for UI development visibility.
            if ($stats['projects_pending_approval'] == 0) {
                $stats['projects_pending_approval'] = 1; // Mock value if actual is 0
            }


            // Placeholder for platform earnings - this would likely involve a more complex query
            // spanning transactions or subscriptions table, which are not defined yet.
            // For now, providing more realistic mocked currency data.
            $stats['platform_earnings'] = [
                'total_revenue' => "USD 150,000.00", // Mocked with currency symbol
                'monthly_revenue' => "USD 12,000.00" // Mocked with currency symbol
            ];

            $stmt_deadlines = $db->query("SELECT COUNT(*) as total FROM projects WHERE deadline >= CURDATE() AND status NOT IN ('Completed', 'Cancelled')");
            $stats['upcoming_deadlines_count'] = $stmt_deadlines->fetchColumn();

            $stmt_overdue = $db->query("SELECT COUNT(*) as total FROM projects WHERE deadline < CURDATE() AND status NOT IN ('Completed', 'Cancelled')");
            $stats['overdue_tasks_count'] = $stmt_overdue->fetchColumn();


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

            // Providing more realistic mocked currency data for project spending.
            $stats['project_spending'] = [
                'total_spent' => "USD 5,250.75", // Mocked with currency
                'last_invoice' => "USD 1,200.50"  // Mocked with currency
            ];


        } elseif ($user_role === 'freelancer') {
            $stmt_open = $db->query("SELECT COUNT(*) as total FROM projects WHERE status = 'Open'");
            $stats['open_projects'] = $stmt_open->fetchColumn();

            $stmt_assigned = $db->prepare("SELECT COUNT(*) as total FROM projects WHERE freelancer_id = :user_id");
            $stmt_assigned->bindParam(':user_id', $user_id);
            $stmt_assigned->execute();
            $stats['assigned_projects'] = $stmt_assigned->fetchColumn();
            
            // Simulating some applications and tasks for UI development
            // $stmt_apps = $db->prepare("SELECT COUNT(*) as total FROM applications WHERE user_id = :user_id AND status = 'submitted'");
            // $stmt_apps->bindParam(':user_id', $user_id);
            // $stmt_apps->execute();
            // $stats['my_applications'] = $stmt_apps->fetchColumn();
            $stats['my_applications'] = 3; // Mock value if actual is 0 or not implemented

            // $stmt_tasks = $db->prepare("SELECT COUNT(t.id) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.freelancer_id = :user_id AND t.status = 'In Progress'");
            // $stmt_tasks->bindParam(':user_id', $user_id);
            // $stmt_tasks->execute();
            // $stats['tasks_in_progress'] = $stmt_tasks->fetchColumn();
            $stats['tasks_in_progress'] = 2; // Mock value if actual is 0 or not implemented

            // Providing more realistic mocked currency data for earnings.
            $stats['earnings_summary'] = [
                'current_month' => "USD 1,800.00",    // Mocked
                'pending_payments' => "USD 450.00", // Mocked
                'lifetime_earnings' => "USD 22,500.00" // Mocked
            ];

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
