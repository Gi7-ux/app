<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../core/database.php';
include_once '../core/utils.php';
include_once '../objects/application.php';
require_once '../migrations/run_migrations.php';

// Run critical migrations to ensure database schema is up to date
run_critical_migrations();

// Validate authentication
$user_data = validate_token();
if (!$user_data) {
    http_response_code(401);
    echo json_encode(array("message" => "Authentication required."));
    exit();
}

// Get database connection
$database = new Database();
$db = $database->connect();

// Prepare application object
$application = new Application($db);

// Get project ID from query parameter
$project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : 0;
if (!$project_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Project ID is required."));
    exit();
}

// Query applications
$stmt = $application->readByProjectId($project_id);
$num = $stmt->rowCount();

// Check if more than 0 record found
if($num > 0){
    $applications_arr = array();
    $applications_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        extract($row);

        $application_item = array(
            "id" => $id,
            "freelancerName" => $freelancer_name,
            "freelancerHandle" => $freelancer_handle,
            "bid" => $bid,
            "note" => $note
        );

        array_push($applications_arr["records"], $application_item);
    }

    http_response_code(200);
    echo json_encode($applications_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No applications found for this project."));
}
?>
