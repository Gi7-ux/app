<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../core/database.php';
include_once '../objects/application.php';

// Get database connection
$database = new Database();
$db = $database->connect();

// Prepare application object
$application = new Application($db);

// Get project ID from URL path
$request_uri = explode('/', $_SERVER['REQUEST_URI']);
$project_id_index = array_search('projects', $request_uri) + 1;
$project_id = isset($request_uri[$project_id_index]) ? intval($request_uri[$project_id_index]) : die();

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
