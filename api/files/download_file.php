<?php
// No JSON headers here, as we'll be outputting a file or an error message.
// Error messages will be plain text or simple JSON if preferred and handled by client.

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$file_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if (!$file_id) {
    http_response_code(400);
    echo "Error: File ID is required.";
    exit;
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (strpos($authHeader, 'Bearer ') === 0) {
    $jwt = substr($authHeader, 7);
} else {
    // Allow token via query parameter for direct download links if necessary, but bearer is preferred.
    $jwt = $_GET['token'] ?? null;
}


if (!$jwt) {
    http_response_code(401);
    // Potentially redirect to login or show a user-friendly error page if accessed via browser directly.
    echo "Access denied. No token provided.";
    exit;
}

try {
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
    $requesting_user_id = $decoded->data->id;
    $requesting_user_role = $decoded->data->role;
} catch (Exception $e) {
    http_response_code(401);
    echo "Access denied. Invalid token: " . $e->getMessage();
    exit;
}

try {
    // Get file details, including project_id
    $file_query = $db->prepare("SELECT f.name, f.path, f.project_id, p.client_id, p.freelancer_id
                                FROM files f
                                JOIN projects p ON f.project_id = p.id
                                WHERE f.id = :file_id");
    $file_query->bindParam(':file_id', $file_id);
    $file_query->execute();
    $file_details = $file_query->fetch(PDO::FETCH_ASSOC);

    if (!$file_details) {
        http_response_code(404);
        echo "Error: File not found.";
        exit;
    }

    // --- Permission Check: User must be part of the project associated with the file ---
    $is_project_member = (
        $requesting_user_role === 'admin' ||
        $requesting_user_id == $file_details['client_id'] ||
        ($file_details['freelancer_id'] && $requesting_user_id == $file_details['freelancer_id'])
    );

    if (!$is_project_member) {
        http_response_code(403);
        echo "Access denied. You are not authorized to download this file.";
        exit;
    }
    // --- End Permission Check ---

    $file_system_path = realpath(__DIR__ . '/../' . $file_details['path']); // Convert relative DB path to absolute system path

    if ($file_system_path && file_exists($file_system_path)) {
        // Set headers to trigger browser download
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream'); // Generic binary, or try to determine from file type
        header('Content-Disposition: attachment; filename="' . basename($file_details['name']) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_system_path));

        // Clear output buffer
        if (ob_get_length()) {
            ob_end_clean();
        }

        readfile($file_system_path);
        exit;
    } else {
        error_log("File not found on filesystem. DB path: {$file_details['path']}, Resolved path: {$file_system_path}, File ID: {$file_id}");
        http_response_code(404);
        echo "Error: File not found on the server, though a record exists. Please contact support.";
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    // Avoid echoing detailed DB errors in production for file downloads. Log them instead.
    error_log("Database error during file download: " . $e->getMessage() . " for File ID: " . $file_id);
    echo "Error: A database error occurred while trying to download the file.";
} catch (Exception $e) {
    http_response_code(500);
    error_log("Unexpected error during file download: " . $e->getMessage() . " for File ID: " . $file_id);
    echo "Error: An unexpected error occurred.";
}
?>
