<?php
// Allow localhost for development CORS
$allowedOrigins = ['http://localhost:5174', 'http://localhost:5173', 'https://yourfrontenddomain.com'];
if(isset($_SERVER['HTTP_ORIGIN'])){
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin"); // Required when allowing credentials
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    if(in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    }
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE"); // Changed to DELETE
header("Access-Control-Max-Age: 3600");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;
use \Firebase\JWT\ExpiredException;
use \Firebase\JWT\SignatureInvalidException;
use \Firebase\JWT\BeforeValidException;

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(503); // Service Unavailable
    echo json_encode(array("message" => "Database connection failed."));
    exit();
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$jwt = null;
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $jwt = $matches[1];
}

if (!$jwt) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
    exit();
}

$decoded_token = null;
try {
    $decoded_token = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
} catch (ExpiredException | SignatureInvalidException | BeforeValidException $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Token is invalid.", "error" => $e->getMessage()));
    exit();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token.", "error" => $e->getMessage()));
    exit();
}

$user_id = $decoded_token->data->id ?? null;
$user_role = $decoded_token->data->role ?? null;

if (!$user_id || !$user_role) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token data."));
    exit();
}

// Admin-only endpoint
if ($user_role !== 'admin') {
    http_response_code(403); // Forbidden
    echo json_encode(array("message" => "Access denied. User does not have sufficient privileges."));
    exit();
}

// Get ticket_id from query parameter or request body
$ticket_id_to_delete = null;
if (isset($_GET['id'])) {
    $ticket_id_to_delete = filter_var($_GET['id'], FILTER_VALIDATE_INT);
} elseif (php_sapi_name() != 'cli' && ($data = json_decode(file_get_contents("php://input"))) && isset($data->ticket_id)) {
    // Check if it's not CLI, then try to read JSON body for DELETE (less common but possible)
    $ticket_id_to_delete = filter_var($data->ticket_id, FILTER_VALIDATE_INT);
}


if ($ticket_id_to_delete === null || $ticket_id_to_delete === false) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete ticket. Ticket ID is required and must be an integer. Provide it as a query parameter 'id' or in the request body as 'ticket_id'."));
    return;
}

// Check if the ticket exists before attempting to delete
$check_query = "SELECT id FROM tickets WHERE id = :ticket_id";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':ticket_id', $ticket_id_to_delete, PDO::PARAM_INT);
$check_stmt->execute();

if ($check_stmt->rowCount() == 0) {
    http_response_code(404); // Not Found
    echo json_encode(array("message" => "Ticket not found. Cannot delete."));
    return;
}


$query = "DELETE FROM tickets WHERE id = :ticket_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':ticket_id', $ticket_id_to_delete, PDO::PARAM_INT);

try {
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200); // Or 204 No Content is also common for DELETE
            echo json_encode(array("message" => "Ticket deleted successfully."));
        } else {
            // Should ideally be caught by the check above, but as a fallback
            http_response_code(404);
            echo json_encode(array("message" => "Ticket not found or already deleted."));
        }
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(array("message" => "Unable to delete ticket. Database execution error."));
    }
} catch (PDOException $e) {
    error_log("PDOException in delete_ticket: " . $e->getMessage() . " Ticket ID: " . $ticket_id_to_delete);
    http_response_code(503);
    echo json_encode(array("message" => "Unable to delete ticket. " . $e->getMessage()));
}

?>
