<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;


$database = new Database();
$db = $database->connect();
if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

file_put_contents('../logs/debug.log', "Read Script Start\n", FILE_APPEND);
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';
file_put_contents('../logs/debug.log', "Authorization Header: " . $authHeader . "\n", FILE_APPEND);

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        
        $query = "SELECT u.id, u.name, u.email, u.phone, u.role, u.company, u.rate, u.avatar, u.status, u.last_seen, GROUP_CONCAT(s.name) as skills 
                  FROM users u 
                  LEFT JOIN user_skills us ON u.id = us.user_id 
                  LEFT JOIN skills s ON us.skill_id = s.id 
                  GROUP BY u.id";

        try {
            $stmt = $db->prepare($query);
            $stmt->execute();
        } catch (PDOException $e) {
            file_put_contents('../logs/debug.log', "SQL Error: " . $e->getMessage() . "\n", FILE_APPEND);
            http_response_code(500);
            echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
            exit();
        }

        if ($stmt->rowCount() > 0) {
            $users_arr = array();
            $users_arr["records"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $skills_arr = ($skills !== null && $skills !== '') ? explode(',', $skills) : [];
                $user_item = array(
                    "id" => $id,
                    "name" => $name,
                    "email" => $email,
                    "phone" => $phone,
                    "role" => $role,
                    "company" => $company,
                    "rate" => $rate,
                    "avatar" => $avatar,
                    "status" => $status,
                    "last_seen" => $last_seen,
                    "skills" => $skills_arr
                );
                array_push($users_arr["records"], $user_item);
            }
            http_response_code(200);
            echo json_encode($users_arr);
        } else {
            file_put_contents('../logs/debug.log', "No users found or fetch error.\n", FILE_APPEND);
            http_response_code(404);
            echo json_encode(
                array("message" => "No users found.")
            );
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
