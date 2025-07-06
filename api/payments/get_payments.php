<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/utils.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$userData = validate_token();
if (!$userData) {
    return;
}

// Only admins can view all payments or filter extensively.
// Clients might view their own payments, freelancers their received payments.
// For now, let's restrict general fetching to admins. Specific user-centric views can be separate endpoints or handled by query params.

$query = "SELECT
            p.id,
            p.invoice_id,
            inv.invoice_number,
            p.project_id,
            proj.title as project_title,
            p.paid_by_user_id,
            payer.name as paid_by_user_name,
            p.paid_to_user_id,
            payee.name as paid_to_user_name,
            p.amount,
            p.payment_date,
            p.payment_method,
            p.transaction_id,
            p.status,
            p.notes,
            p.created_at
          FROM
            payments p
          LEFT JOIN
            invoices inv ON p.invoice_id = inv.id
          LEFT JOIN
            projects proj ON p.project_id = proj.id
          LEFT JOIN
            users payer ON p.paid_by_user_id = payer.id
          LEFT JOIN
            users payee ON p.paid_to_user_id = payee.id";

$whereClauses = [];
$params = [];

// Filter by project_id
if (isset($_GET['project_id'])) {
    $whereClauses[] = "p.project_id = :project_id";
    $params[':project_id'] = htmlspecialchars(strip_tags($_GET['project_id']));
}

// Filter by client_id (paid_by_user_id)
if (isset($_GET['client_id'])) {
    $whereClauses[] = "p.paid_by_user_id = :client_id";
    $params[':client_id'] = htmlspecialchars(strip_tags($_GET['client_id']));
}

// Filter by freelancer_id (paid_to_user_id)
if (isset($_GET['freelancer_id'])) {
    $whereClauses[] = "p.paid_to_user_id = :freelancer_id";
    $params[':freelancer_id'] = htmlspecialchars(strip_tags($_GET['freelancer_id']));
}

// Filter by invoice_id
if (isset($_GET['invoice_id'])) {
    $whereClauses[] = "p.invoice_id = :invoice_id";
    $params[':invoice_id'] = htmlspecialchars(strip_tags($_GET['invoice_id']));
}

// Filter by status
if (isset($_GET['status'])) {
    $whereClauses[] = "p.status = :status";
    $params[':status'] = htmlspecialchars(strip_tags($_GET['status']));
}

// Date range filters
if (isset($_GET['start_date'])) {
    $whereClauses[] = "p.payment_date >= :start_date";
    $params[':start_date'] = htmlspecialchars(strip_tags($_GET['start_date']));
}
if (isset($_GET['end_date'])) {
    $whereClauses[] = "p.payment_date <= :end_date";
    $params[':end_date'] = htmlspecialchars(strip_tags($_GET['end_date']));
}

// Security: Non-admins can only see their own payments (either made or received)
if ($userData->role !== 'admin') {
    // Clients see payments they made, Freelancers see payments they received
    $userSpecificClause = "(p.paid_by_user_id = :user_id OR p.paid_to_user_id = :user_id)";
    if ($userData->role === 'client') {
         $userSpecificClause = "p.paid_by_user_id = :user_id"; // Clients only see what they paid
    } elseif ($userData->role === 'freelancer') {
         $userSpecificClause = "p.paid_to_user_id = :user_id"; // Freelancers only see what they received
    }
    $whereClauses[] = $userSpecificClause;
    $params[':user_id'] = $userData->id;
}


if (!empty($whereClauses)) {
    $query .= " WHERE " . implode(" AND ", $whereClauses);
}

$query .= " ORDER BY p.payment_date DESC";

// Pagination
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

$query .= " LIMIT :limit OFFSET :offset";
$params[':limit'] = $limit;
$params[':offset'] = $offset;


$stmt = $db->prepare($query);

foreach ($params as $key => &$val) {
    if ($key === ':limit' || $key === ':offset') {
        $stmt->bindParam($key, $val, PDO::PARAM_INT);
    } else {
        $stmt->bindParam($key, $val);
    }
}

try {
    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) FROM payments p";
    if (!empty($whereClauses)) {
        $countQuery .= " WHERE " . implode(" AND ", $whereClauses);
    }
    // Remove user_id from params if it was added for non-admin for count query if needed, or re-prepare
    $countParams = $params;
    unset($countParams[':limit']);
    unset($countParams[':offset']);

    $countStmt = $db->prepare($countQuery);
    // Bind params again for count query (excluding limit/offset)
    foreach ($countParams as $key => &$val) {
        $countStmt->bindParam($key, $val);
    }
    $countStmt->execute();
    $totalRecords = $countStmt->fetchColumn();

    if ($payments) {
        http_response_code(200);
        echo json_encode([
            "message" => "Payments retrieved successfully.",
            "data" => $payments,
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "totalRecords" => (int)$totalRecords,
                "totalPages" => ceil($totalRecords / $limit)
            ]
        ]);
    } else {
        http_response_code(200); // Or 404 if no records found is preferred
        echo json_encode([
            "message" => "No payments found matching criteria.",
            "data" => [],
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "totalRecords" => 0,
                "totalPages" => 0
            ]
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error retrieving payments: " . $e->getMessage()));
}
?>
