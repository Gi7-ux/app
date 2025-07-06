<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

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

        if (!empty($data->current_password) && !empty($data->new_password)) {
            // Get user's current password from DB
            $pass_stmt = $db->prepare("SELECT password FROM users WHERE id = :id");
            $pass_stmt->bindParam(':id', $user_id);
            $pass_stmt->execute();
            $current_password_db = $pass_stmt->fetchColumn();

            if (password_verify($data->current_password, $current_password_db)) {
                $new_password_hashed = password_hash($data->new_password, PASSWORD_DEFAULT);

                $query = "UPDATE users SET password = :password WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':password', $new_password_hashed);
                $stmt->bindParam(':id', $user_id);

                if ($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Password updated successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update password."));
                }
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Incorrect current password."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update password. Data is incomplete."));
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
