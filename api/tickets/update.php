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
header("Access-Control-Allow-Methods: PUT"); // Changed to PUT
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

$data = json_decode(file_get_contents("php://input"));

// Validate input: ticket_id is required
if (!isset($data->ticket_id) || empty($data->ticket_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update ticket. Ticket ID is required."));
    return;
}

$ticket_id_to_update = filter_var($data->ticket_id, FILTER_VALIDATE_INT);
if ($ticket_id_to_update === false) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid Ticket ID provided."));
    return;
}

// Check if the ticket exists
$check_query = "SELECT id FROM tickets WHERE id = :ticket_id";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':ticket_id', $ticket_id_to_update, PDO::PARAM_INT);
$check_stmt->execute();

if ($check_stmt->rowCount() == 0) {
    http_response_code(404); // Not Found
    echo json_encode(array("message" => "Ticket not found."));
    return;
}


$fields_to_update = [];
$params = [':ticket_id' => $ticket_id_to_update];

if (isset($data->title) && !empty(trim($data->title))) {
    $fields_to_update[] = "title = :title";
    $params[':title'] = htmlspecialchars(strip_tags(trim($data->title)));
}
if (isset($data->description) && !empty(trim($data->description))) {
    $fields_to_update[] = "description = :description";
    $params[':description'] = htmlspecialchars(strip_tags(trim($data->description)));
}
if (isset($data->category) && !empty(trim($data->category))) {
    $allowed_categories = [
        'GENERAL_INQUIRY', 'TECHNICAL_ISSUE', 'FEEDBACK_SUGGESTION',
        'PROJECT_INQUIRY', 'BILLING_ISSUE', 'FREELANCER_CONCERN',
        'APPLICATION_INQUIRY', 'PAYMENT_ISSUE', 'CLIENT_CONCERN',
        'USER_MANAGEMENT', 'PLATFORM_MODERATION' // Admins can set these too
    ];
    if (in_array($data->category, $allowed_categories)) {
        $fields_to_update[] = "category = :category";
        $params[':category'] = htmlspecialchars(strip_tags(trim($data->category)));
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid category value provided for update."));
        return;
    }
}
if (isset($data->priority) && in_array($data->priority, ['Low', 'Medium', 'High'])) {
    $fields_to_update[] = "priority = :priority";
    $params[':priority'] = $data->priority;
}
if (isset($data->status) && in_array($data->status, ['Open', 'In Progress', 'Resolved', 'Closed'])) {
    $fields_to_update[] = "status = :status";
    $params[':status'] = $data->status;
}

if (empty($fields_to_update)) {
    http_response_code(400);
    echo json_encode(array("message" => "No valid fields provided for update."));
    return;
}

// Add updated_at timestamp
$fields_to_update[] = "updated_at = CURRENT_TIMESTAMP";

$query = "UPDATE tickets SET " . implode(", ", $fields_to_update) . " WHERE id = :ticket_id";

$stmt = $db->prepare($query);

try {
    if ($stmt->execute($params)) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Ticket updated successfully."));
        } else {
            // This can happen if the data provided is the same as current data,
            // or if the ticket_id was valid but somehow update failed without exception.
            http_response_code(200); // Or 304 Not Modified, but 200 is fine.
            echo json_encode(array("message" => "Ticket update processed, but no rows were changed. Data might be the same."));
        }
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(array("message" => "Unable to update ticket. Database execution error."));
    }
} catch (PDOException $e) {
    error_log("PDOException in update_ticket: " . $e->getMessage() . " Query: " . $query . " Params: " . print_r($params, true));
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update ticket. " . $e->getMessage()));
}

?>
