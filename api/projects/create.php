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

        if ($decoded->data->role !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied."));
            return;
        }

        if (
            !empty($data->title) &&
            !empty($data->client_id) &&
            !empty($data->budget)
            // Deadline is also required by frontend form, but API can make it optional or set a default if not provided
        ) {
            $data->description = $data->description ?? '';
            $data->deadline = $data->deadline ?? null;
            $data->freelancer_id = $data->freelancer_id ?? null;
            $data->status = $data->status ?? 'Open'; // Default status to 'Open'
            $data->purchased_hours = $data->purchased_hours ?? 0;

            $query = "INSERT INTO projects SET
                        title=:title,
                        description=:description,
                        client_id=:client_id,
                        budget=:budget,
                        deadline=:deadline,
                        freelancer_id=:freelancer_id,
                        status=:status,
                        purchased_hours=:purchased_hours";
            $stmt = $db->prepare($query);

            // Sanitize inputs
            $data->title = htmlspecialchars(strip_tags($data->title));
            $data->description = htmlspecialchars(strip_tags($data->description));
            $data->client_id = htmlspecialchars(strip_tags($data->client_id));
            $data->budget = htmlspecialchars(strip_tags($data->budget));
            if ($data->deadline) $data->deadline = htmlspecialchars(strip_tags($data->deadline));
            if ($data->freelancer_id) $data->freelancer_id = htmlspecialchars(strip_tags($data->freelancer_id));
            $data->status = htmlspecialchars(strip_tags($data->status));
            $data->purchased_hours = htmlspecialchars(strip_tags($data->purchased_hours));


            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":client_id", $data->client_id);
            $stmt->bindParam(":budget", $data->budget);
            $stmt->bindParam(":deadline", $data->deadline, $data->deadline === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindParam(":freelancer_id", $data->freelancer_id, $data->freelancer_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindParam(":status", $data->status);
            $stmt->bindParam(":purchased_hours", $data->purchased_hours);


            if ($stmt->execute()) {
                $new_project_id = $db->lastInsertId();
                http_response_code(201);
                echo json_encode(array("message" => "Project was created.", "id" => $new_project_id));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create project.", "errorInfo" => $stmt->errorInfo()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create project. Data is incomplete."));
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
