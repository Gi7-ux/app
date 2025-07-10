<?php

/**
 * Check if a table exists in the database (SQLite version).
 *
 * @param PDO $db
 * @param string $table_name
 * @return bool
 */
function table_exists(PDO $db, string $table_name): bool {
    $query = "SELECT name FROM sqlite_master WHERE type='table' AND name = :table_name";
    $stmt = $db->prepare($query);
    $stmt->execute([':table_name' => $table_name]);
    return $stmt->rowCount() > 0;
}

/**
 * Check if a column exists in a specific table (SQLite version).
 *
 * @param PDO $db
 * @param string $table_name
 * @param string $column_name
 * @return bool
 */
function column_exists(PDO $db, string $table_name, string $column_name): bool {
    $query = "PRAGMA table_info(" . $table_name . ")";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        if ($column['name'] === $column_name) {
            return true;
        }
    }
    return false;
}
require_once 'config.php';
require_once __DIR__ . '/../vendor/autoload.php';

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

/**
 * Check if a user has permission for a specific project.
 * Checks if the user is the client, freelancer, or admin for the project.
 *
 * @param PDO $db The database connection.
 * @param int $user_id The ID of the user.
 * @param int $project_id The ID of the project.
 * @return bool True if the user has permission, false otherwise.
 */
function check_project_permission(PDO $db, int $user_id, int $project_id): bool {
    // Check if the user is the client, freelancer, or is an admin
    $query = "SELECT COUNT(*) FROM projects WHERE id = :project_id AND (client_id = :user_id OR freelancer_id = :user_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':project_id', $project_id);
    $stmt->execute();
    
    if ($stmt->fetchColumn() > 0) {
        return true;
    }
    
    // Check if user is admin
    $query = "SELECT role FROM users WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $role = $stmt->fetchColumn();
    
    return $role === 'admin';
}
?>
