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
        ) {
            $data->description = $data->description ?? '';
            $data->deadline = $data->deadline ?? '';
            $query = "INSERT INTO projects SET title=:title, description=:description, client_id=:client_id, budget=:budget, deadline=:deadline";
            $stmt = $db->prepare($query);

            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":client_id", $data->client_id);
            $stmt->bindParam(":budget", $data->budget);
            $stmt->bindParam(":deadline", $data->deadline);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Project was created."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create project."));
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
