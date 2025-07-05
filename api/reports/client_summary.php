<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/utils.php';


$database = new Database();
$db = $database->connect();
if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$data = validate_token();

if ($data->role !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied."));
    return;
}

// This query aggregates project data for each client
$query = "SELECT 
            c.id,
            c.name,
            c.company,
            COUNT(p.id) as total_projects,
            SUM(p.budget) as total_budget,
            SUM(p.spend) as total_spend,
            AVG(DATEDIFF(p.deadline, p.created_at)) as avg_project_duration_days
          FROM 
            users c
          LEFT JOIN 
            projects p ON c.id = p.client_id
          WHERE
            c.role = 'client'
          GROUP BY
            c.id";

$stmt = $db->prepare($query);
$stmt->execute();

$report_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($report_data);
?>
