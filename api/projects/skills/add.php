<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../core/database.php';
require_once '../../core/config.php';
require_once '../../core/utils.php';
require_once '../../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$decoded_token = validate_token_and_get_data();
if (!$decoded_token) {
    return;
}
// Optional: Add role check if needed (e.g., only admin or project manager can add skills)

if (
    !empty($data->project_id) &&
    !empty($data->skill_name)
) {
    // Check if project exists
    $proj_stmt = $db->prepare("SELECT id FROM projects WHERE id = :project_id");
    $proj_stmt->bindParam(':project_id', $data->project_id);
    $proj_stmt->execute();
    if($proj_stmt->rowCount() == 0){
        http_response_code(404);
        echo json_encode(array("message" => "Project not found. Cannot add skill."));
        return;
    }

    $query = "INSERT IGNORE INTO project_skills SET project_id = :project_id, skill_name = :skill_name";
    // Using INSERT IGNORE to prevent errors if the skill already exists for the project (based on UNIQUE KEY)
    $stmt = $db->prepare($query);

    $data->project_id = htmlspecialchars(strip_tags($data->project_id));
    $data->skill_name = htmlspecialchars(strip_tags($data->skill_name));

    $stmt->bindParam(":project_id", $data->project_id);
    $stmt->bindParam(":skill_name", $data->skill_name);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(201);
            echo json_encode(array("message" => "Skill added to project."));
        } else {
            http_response_code(200); // Or 409 Conflict if preferred for already existing
            echo json_encode(array("message" => "Skill already associated with this project."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to add skill to project."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to add skill. Project ID and skill name are required."));
}
?>
