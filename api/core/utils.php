<?php
require_once 'config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

function validate_token() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    $arr = explode(" ", $authHeader);
    $jwt = $arr[1] ?? '';

    if ($jwt) {
        try {
            $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
            return $decoded->data;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied. No token provided."));
        exit();
    }
}
?>