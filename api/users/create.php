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

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput);
file_put_contents('../logs/debug.log', "User Create Request: " . $rawInput . "\n", FILE_APPEND);

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
            !empty($data->name) &&
            !empty($data->email) &&
            !empty($data->password) &&
            !empty($data->role)
        ) {
            $query = "INSERT INTO users SET name=:name, email=:email, password=:password, phone=:phone, role=:role, company=:company, rate=:rate, status=:status";
            $stmt = $db->prepare($query);

            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $status = !empty($data->status) ? $data->status : 'active';

            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":email", $data->email);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":phone", $data->phone);
            $stmt->bindParam(":role", $data->role);
            $stmt->bindParam(":company", $data->company);
            $stmt->bindParam(":rate", $data->rate);
            $stmt->bindParam(":status", $status);

            if ($stmt->execute()) {
                $id = $db->lastInsertId();
                http_response_code(201);
                echo json_encode(array("message" => "User was created.", "id" => $id));
            } else {
                $errorInfo = $stmt->errorInfo();
                file_put_contents('../logs/debug.log', "User Create SQL Error: " . print_r($errorInfo, true) . "\n", FILE_APPEND);
                http_response_code(503);
                echo json_encode(array(
                    "message" => "Unable to create user.",
                    "error" => $errorInfo[2],
                    "sqlstate" => $errorInfo[0],
                    "code" => $errorInfo[1],
                    "request" => $rawInput
                ));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
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
