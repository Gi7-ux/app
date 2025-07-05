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

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $query = "SELECT id, name, role FROM users WHERE role IN ('client', 'freelancer') AND status = 'active'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $clients = array_filter($users, fn($u) => $u['role'] === 'client');
        $freelancers = array_filter($users, fn($u) => $u['role'] === 'freelancer');
        http_response_code(200);
        echo json_encode([
            'clients' => array_values($clients),
            'freelancers' => array_values($freelancers)
        ]);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied.", "error" => $e->getMessage()]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. No token provided."]);
}
