<?php
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

$data = json_decode(file_get_contents("php://input"));

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;

        if (
            !empty($data->task_id) &&
            !empty($data->project_id) &&
            !empty($data->hours)
        ) {
            $query = "INSERT INTO time_logs SET user_id=:user_id, task_id=:task_id, project_id=:project_id, hours=:hours, log_date=:log_date";
            $stmt = $db->prepare($query);

            $log_date = date('Y-m-d');

            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":task_id", $data->task_id);
            $stmt->bindParam(":project_id", $data->project_id);
            $stmt->bindParam(":hours", $data->hours);
            $stmt->bindParam(":log_date", $log_date);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Time log was created."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create time log."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create time log. Data is incomplete."));
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
