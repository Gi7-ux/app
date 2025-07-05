<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");
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
// Optional: Role check

if (
    !empty($data->project_id) &&
    !empty($data->skill_name)
) {
    $query = "DELETE FROM project_skills WHERE project_id = :project_id AND skill_name = :skill_name";
    $stmt = $db->prepare($query);

    $data->project_id = htmlspecialchars(strip_tags($data->project_id));
    $data->skill_name = htmlspecialchars(strip_tags($data->skill_name));

    $stmt->bindParam(":project_id", $data->project_id);
    $stmt->bindParam(":skill_name", $data->skill_name);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Skill removed from project."));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Skill not found for this project or already removed."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to remove skill from project."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to remove skill. Project ID and skill name are required."));
}
?>
