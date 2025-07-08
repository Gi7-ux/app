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
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';
require_once '../core/utils.php'; // For log_activity if needed

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

// Get JWT from Authorization header
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
} catch (ExpiredException $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Token has expired.", "error" => $e->getMessage()));
    exit();
} catch (SignatureInvalidException $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token signature.", "error" => $e->getMessage()));
    exit();
} catch (BeforeValidException $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Token not yet valid.", "error" => $e->getMessage()));
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

$data = json_decode(file_get_contents("php://input"));

// Validate input
if (
    !isset($data->title) || empty(trim($data->title)) ||
    !isset($data->description) || empty(trim($data->description)) ||
    !isset($data->category) || empty(trim($data->category))
) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create ticket. Title, description, and category are required."));
    return;
}

// Validate category (optional: more robust validation against a predefined list)
$allowed_categories = [
    'GENERAL_INQUIRY', 'TECHNICAL_ISSUE', 'FEEDBACK_SUGGESTION',
    'PROJECT_INQUIRY', 'BILLING_ISSUE', 'FREELANCER_CONCERN',
    'APPLICATION_INQUIRY', 'PAYMENT_ISSUE', 'CLIENT_CONCERN'
    // USER_MANAGEMENT and PLATFORM_MODERATION are more for admin use, not direct submission by users.
];
if (!in_array($data->category, $allowed_categories)) {
    // Check if it's an admin trying to use an admin category - this logic can be expanded
    $admin_only_categories = ['USER_MANAGEMENT', 'PLATFORM_MODERATION'];
    if (!($user_role === 'admin' && in_array($data->category, $admin_only_categories))) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid category provided."));
        return;
    }
}


$priority = isset($data->priority) && in_array($data->priority, ['Low', 'Medium', 'High']) ? $data->priority : 'Medium'; // Default priority

$query = "INSERT INTO tickets (user_id, title, description, category, priority, status)
          VALUES (:user_id, :title, :description, :category, :priority, 'Open')";

$stmt = $db->prepare($query);

// Sanitize data
$title = htmlspecialchars(strip_tags(trim($data->title)));
$description = htmlspecialchars(strip_tags(trim($data->description)));
$category_val = htmlspecialchars(strip_tags(trim($data->category)));

// Bind values
$stmt->bindParam(':user_id', $user_id);
$stmt->bindParam(':title', $title);
$stmt->bindParam(':description', $description);
$stmt->bindParam(':category', $category_val);
$stmt->bindParam(':priority', $priority);

try {
    if ($stmt->execute()) {
        $ticket_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array(
            "message" => "Ticket created successfully.",
            "ticket_id" => $ticket_id,
            "user_id" => $user_id,
            "title" => $title,
            "category" => $category_val,
            "priority" => $priority,
            "status" => "Open"
        ));
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(array("message" => "Unable to create ticket. Database execution error."));
    }
} catch (PDOException $e) {
    error_log("PDOException in create_ticket: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(array("message" => "Unable to create ticket. " . $e->getMessage()));
}

?>
