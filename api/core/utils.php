<?php

/**
 * Check if a table exists in the database.
 *
 * @param PDO $db
 * @param string $table_name
 * @return bool
 */
function table_exists(PDO $db, string $table_name): bool {
    $query = "SHOW TABLES LIKE :table_name";
    $stmt = $db->prepare($query);
    $stmt->execute([':table_name' => $table_name]);
    return $stmt->rowCount() > 0;
}

/**
 * Check if a column exists in a specific table.
 *
 * @param PDO $db
 * @param string $table_name
 * @param string $column_name
 * @return bool
 */
function column_exists(PDO $db, string $table_name, string $column_name): bool {
    // Load allowed tables from configuration and create a lookup map
    static $allowed_tables_map = null;
    if ($allowed_tables_map === null) {
        $allowed_tables_map = array_flip(unserialize(ALLOWED_TABLES));
    }

    // Validate table name against the whitelist using O(1) lookup
    if (!isset($allowed_tables_map[$table_name])) {
        // Log this attempt for security monitoring
        error_log("Attempted to access invalid table: " . $table_name);
        return false;
    }

    $query = "SHOW COLUMNS FROM `" . $table_name . "` LIKE :column_name";
    $stmt = $db->prepare($query);
    $stmt->execute([':column_name' => $column_name]);
    return $stmt->rowCount() > 0;
}
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

/**
 * Check if a user has permission for a specific project.
 * This is a placeholder function. Actual implementation might involve
 * checking roles, project membership, or other authorization logic.
 *
 * @param PDO $db The database connection.
 * @param int $user_id The ID of the user.
 * @param int $project_id The ID of the project.
 * @return bool True if the user has permission, false otherwise.
 */
function check_project_permission(PDO $db, int $user_id, int $project_id): bool {
    // Example: Check if the user is a member of the project
    // This assumes a 'project_members' table with 'user_id' and 'project_id'
    $query = "SELECT COUNT(*) FROM project_members WHERE user_id = :user_id AND project_id = :project_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':project_id', $project_id);
    $stmt->execute();
    return $stmt->fetchColumn() > 0;
}
?>
