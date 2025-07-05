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

validate_token();

$query = "SELECT 
            p.id, 
            p.title, 
            p.description, 
            c.name as clientName, 
            f.name as freelancerName, 
            p.status, 
            p.budget,
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
        "deadline" => $deadline
    );
    array_push($projects_arr["records"], $project_item);
}

http_response_code(200);
echo json_encode($projects_arr);
?>
