<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, PATCH"); // Typically PUT for full update, PATCH for partial
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

// Only admins should be able to update payment details freely.
// Other roles might have very restricted update capabilities (e.g., a user updating notes on a payment they made).
// For now, let's restrict to admin.
if ($userData->role !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied. Only admins can update payment records."));
    return;
}

$request_data = json_decode(file_get_contents("php://input"));

if (!isset($request_data->id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Payment ID is required."));
    return;
}

$payment_id = htmlspecialchars(strip_tags($request_data->id));

// Fetch the existing payment to see what's being changed, and for logging or validation if needed.
$fetchQuery = "SELECT * FROM payments WHERE id = :id";
$fetchStmt = $db->prepare($fetchQuery);
$fetchStmt->bindParam(':id', $payment_id);
$fetchStmt->execute();
$existingPayment = $fetchStmt->fetch(PDO::FETCH_ASSOC);

if (!$existingPayment) {
    http_response_code(404);
    echo json_encode(array("message" => "Payment not found."));
    return;
}

// Build the update query dynamically based on provided fields
$updateFields = [];
$params = [':id' => $payment_id];

if (isset($request_data->invoice_id)) {
    $updateFields[] = "invoice_id = :invoice_id";
    $params[':invoice_id'] = htmlspecialchars(strip_tags($request_data->invoice_id));
}
if (isset($request_data->project_id)) {
    $updateFields[] = "project_id = :project_id";
    $params[':project_id'] = htmlspecialchars(strip_tags($request_data->project_id));
}
if (isset($request_data->paid_by_user_id)) {
    $updateFields[] = "paid_by_user_id = :paid_by_user_id";
    $params[':paid_by_user_id'] = htmlspecialchars(strip_tags($request_data->paid_by_user_id));
}
if (isset($request_data->paid_to_user_id)) {
    $updateFields[] = "paid_to_user_id = :paid_to_user_id";
    $params[':paid_to_user_id'] = htmlspecialchars(strip_tags($request_data->paid_to_user_id));
}
if (isset($request_data->amount)) {
    $updateFields[] = "amount = :amount";
    $params[':amount'] = htmlspecialchars(strip_tags($request_data->amount));
}
if (isset($request_data->payment_date)) {
    $updateFields[] = "payment_date = :payment_date";
    $params[':payment_date'] = htmlspecialchars(strip_tags($request_data->payment_date));
}
if (isset($request_data->payment_method)) {
    $updateFields[] = "payment_method = :payment_method";
    $params[':payment_method'] = htmlspecialchars(strip_tags($request_data->payment_method));
}
if (isset($request_data->transaction_id)) {
    $updateFields[] = "transaction_id = :transaction_id";
    $params[':transaction_id'] = htmlspecialchars(strip_tags($request_data->transaction_id));
}
if (isset($request_data->status)) {
    $updateFields[] = "status = :status";
    $params[':status'] = htmlspecialchars(strip_tags($request_data->status));
}
if (isset($request_data->notes)) {
    $updateFields[] = "notes = :notes";
    $params[':notes'] = htmlspecialchars(strip_tags($request_data->notes));
}

if (empty($updateFields)) {
    http_response_code(400);
    echo json_encode(array("message" => "No fields provided for update."));
    return;
}

$query = "UPDATE payments SET " . implode(", ", $updateFields) . " WHERE id = :id";
$stmt = $db->prepare($query);

// Note: Updating financial summary columns (total_paid_amount on projects, total_spent/earned on users)
// can be complex if the amount or relevant user IDs of a payment change.
// This might require recalculating totals or adjusting them based on the difference.
// For simplicity, this basic update doesn't automatically adjust those summary columns.
// A more robust solution would handle these recalculations, possibly in a transaction.
// For now, we assume these are minor corrections and financial summaries are primarily driven by new payments or deletions.

try {
    if ($stmt->execute($params)) {
        if ($stmt->rowCount()) {
            http_response_code(200);
            echo json_encode(array("message" => "Payment updated successfully."));
        } else {
            // Query executed, but no rows affected (e.g., data was the same, or ID not found though checked above)
            http_response_code(200); // Or 304 Not Modified, or 404 if ID somehow became invalid
            echo json_encode(array("message" => "Payment update executed, but no changes were made or ID not found."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update payment."));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error updating payment: " . $e->getMessage()));
}
?>
