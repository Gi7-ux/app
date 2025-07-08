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
header("Access-Control-Allow-Methods: GET");

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

// Base query - join with users table to get submitter's name/email
$query = "SELECT t.id, t.user_id, u.name as user_name, u.email as user_email, t.title, t.description, t.category, t.priority, t.status, t.created_at, t.updated_at
          FROM tickets t
          JOIN users u ON t.user_id = u.id";

$where_clauses = [];
$params = [];

// Role-based access control
if ($user_role !== 'admin') {
    $where_clauses[] = "t.user_id = :user_id_param";
    $params[':user_id_param'] = $user_id;
}

// Filtering options (can be expanded)
if (isset($_GET['status'])) {
    $where_clauses[] = "t.status = :status_param";
    $params[':status_param'] = htmlspecialchars(strip_tags($_GET['status']));
}
if (isset($_GET['priority'])) {
    $where_clauses[] = "t.priority = :priority_param";
    $params[':priority_param'] = htmlspecialchars(strip_tags($_GET['priority']));
}
if (isset($_GET['category'])) {
    $where_clauses[] = "t.category = :category_param";
    $params[':category_param'] = htmlspecialchars(strip_tags($_GET['category']));
}
if (isset($_GET['ticket_id'])) {
    $where_clauses[] = "t.id = :ticket_id_param";
    $params[':ticket_id_param'] = htmlspecialchars(strip_tags($_GET['ticket_id']));
}


if (!empty($where_clauses)) {
    $query .= " WHERE " . implode(" AND ", $where_clauses);
}

// Ordering (default by created_at descending)
$query .= " ORDER BY t.created_at DESC";

// Pagination (optional, simple example)
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20; // Default 20 items per page
$offset = ($page - 1) * $limit;

$query .= " LIMIT :limit OFFSET :offset";
$params[':limit'] = $limit;
$params[':offset'] = $offset;


try {
    $stmt = $db->prepare($query);

    // Bind all parameters
    foreach ($params as $key => $value) {
        // Determine type for binding (PDO::PARAM_INT or PDO::PARAM_STR)
        // For simplicity, using PDO::PARAM_STR for most, but integers should be PARAM_INT
        if (is_int($value)) {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
    }

    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $tickets_arr = array();
        $tickets_arr["records"] = array();
        // TODO: Add pagination info if implementing full pagination (total_pages, total_records)

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $ticket_item = array(
                "id" => $id,
                "user_id" => $user_id,
                "user_name" => $user_name, // Added from JOIN
                "user_email" => $user_email, // Added from JOIN
                "title" => $title,
                "description" => $description,
                "category" => $category,
                "priority" => $priority,
                "status" => $status,
                "created_at" => $created_at,
                "updated_at" => $updated_at
            );
            array_push($tickets_arr["records"], $ticket_item);
        }
        http_response_code(200);
        echo json_encode($tickets_arr);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "No tickets found."));
    }
} catch (PDOException $e) {
    error_log("PDOException in read_tickets: " . $e->getMessage() . " Query: " . $query . " Params: " . print_r($params, true));
    http_response_code(503); // Service Unavailable
    echo json_encode(array("message" => "Unable to retrieve tickets. " . $e->getMessage()));
}

?>
