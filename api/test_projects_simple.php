<?php
// Simple test for projects read endpoint without token validation
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'core/database.php';

echo "Testing projects/read.php without token validation...\n\n";

try {
    $database = new Database();
    $db = $database->connect();
    if ($db === null) {
        http_response_code(500);
        echo json_encode(["message" => "Database connection failed."]);
        exit();
    }

    $query = "SELECT 
                p.id, 
                p.title, 
                p.description, 
                IFNULL(c.name, c.email) as clientName, 
                CASE WHEN f.id IS NULL THEN 'Unassigned' ELSE IFNULL(f.name, f.email) END as freelancerName, 
                p.status, 
                p.budget,
                COALESCE(p.total_invoiced_amount, 0) as spend,
                p.deadline
              FROM 
                projects p
              JOIN 
                users c ON p.client_id = c.id
              LEFT JOIN 
                users f ON p.freelancer_id = f.id";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $projects_arr = array();
    $projects_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $project_item = array(
            "id" => $id,
            "title" => $title,
            "description" => $description,
            "clientName" => $clientName,
            "freelancerName" => $freelancerName,
            "status" => $status,
            "budget" => $budget,
            "spend" => $spend,
            "deadline" => $deadline
        );
        array_push($projects_arr["records"], $project_item);
    }

    http_response_code(200);
    echo json_encode($projects_arr);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage()]);
}
?>
