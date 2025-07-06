<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/utils.php'; // For validate_token and other utilities

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

// Validate token and get user data
// For creating payments, typically an admin or a client (paying for a project) would do this.
// Let's assume admin for now, or a client paying for their own project.
$userData = validate_token();
if (!$userData) {
    // validate_token already sent an error response
    return;
}

$request_data = json_decode(file_get_contents("php://input"));

// Basic validation
if (
    !isset($request_data->amount) ||
    !isset($request_data->payment_date) ||
    !isset($request_data->paid_by_user_id) ||
    (!isset($request_data->project_id) && !isset($request_data->invoice_id))
) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing required payment data. 'amount', 'payment_date', 'paid_by_user_id' are required, and either 'project_id' or 'invoice_id'."));
    return;
}

// Security check: if the user is not an admin, they can only record payments they made.
if ($userData->role !== 'admin' && $userData->id != $request_data->paid_by_user_id) {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied. You can only record payments made by yourself."));
    return;
}

// Further validation can be added here (e.g., check if project_id or invoice_id exist)

$query = "INSERT INTO payments
            (invoice_id, project_id, paid_by_user_id, paid_to_user_id, amount, payment_date, payment_method, transaction_id, status, notes)
          VALUES
            (:invoice_id, :project_id, :paid_by_user_id, :paid_to_user_id, :amount, :payment_date, :payment_method, :transaction_id, :status, :notes)";

$stmt = $db->prepare($query);

// Sanitize and bind parameters
$invoice_id = isset($request_data->invoice_id) ? htmlspecialchars(strip_tags($request_data->invoice_id)) : null;
$project_id = isset($request_data->project_id) ? htmlspecialchars(strip_tags($request_data->project_id)) : null;
$paid_by_user_id = htmlspecialchars(strip_tags($request_data->paid_by_user_id));
$paid_to_user_id = isset($request_data->paid_to_user_id) ? htmlspecialchars(strip_tags($request_data->paid_to_user_id)) : null;
$amount = htmlspecialchars(strip_tags($request_data->amount));
$payment_date = htmlspecialchars(strip_tags($request_data->payment_date));
$payment_method = isset($request_data->payment_method) ? htmlspecialchars(strip_tags($request_data->payment_method)) : null;
$transaction_id = isset($request_data->transaction_id) ? htmlspecialchars(strip_tags($request_data->transaction_id)) : null;
$status = isset($request_data->status) ? htmlspecialchars(strip_tags($request_data->status)) : 'completed';
$notes = isset($request_data->notes) ? htmlspecialchars(strip_tags($request_data->notes)) : null;

$stmt->bindParam(':invoice_id', $invoice_id);
$stmt->bindParam(':project_id', $project_id);
$stmt->bindParam(':paid_by_user_id', $paid_by_user_id);
$stmt->bindParam(':paid_to_user_id', $paid_to_user_id);
$stmt->bindParam(':amount', $amount);
$stmt->bindParam(':payment_date', $payment_date);
$stmt->bindParam(':payment_method', $payment_method);
$stmt->bindParam(':transaction_id', $transaction_id);
$stmt->bindParam(':status', $status);
$stmt->bindParam(':notes', $notes);

$db->beginTransaction();

try {
    if ($stmt->execute()) {
        $payment_id = $db->lastInsertId();

        // After successful payment insertion, update project's total_paid_amount
        if ($project_id) {
            $updateProjectQuery = "UPDATE projects SET total_paid_amount = total_paid_amount + :amount WHERE id = :project_id";
            $updateStmt = $db->prepare($updateProjectQuery);
            $updateStmt->bindParam(':amount', $amount);
            $updateStmt->bindParam(':project_id', $project_id);
            $updateStmt->execute();
        }

        // Update user's total_spent_as_client
        $updateUserSpentQuery = "UPDATE users SET total_spent_as_client = total_spent_as_client + :amount WHERE id = :user_id";
        $updateUserStmt = $db->prepare($updateUserSpentQuery);
        $updateUserStmt->bindParam(':amount', $amount);
        $updateUserStmt->bindParam(':user_id', $paid_by_user_id);
        $updateUserStmt->execute();

        // Update user's total_earned if paid_to_user_id is set
        if ($paid_to_user_id) {
            $updateUserEarnedQuery = "UPDATE users SET total_earned = total_earned + :amount WHERE id = :user_id";
            $updateUserEarnedStmt = $db->prepare($updateUserEarnedQuery);
            $updateUserEarnedStmt->bindParam(':amount', $amount);
            $updateUserEarnedStmt->bindParam(':user_id', $paid_to_user_id);
            $updateUserEarnedStmt->execute();
        }

        $db->commit();
        http_response_code(201);
        echo json_encode(array("message" => "Payment recorded successfully.", "id" => $payment_id));
    } else {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(array("message" => "Unable to record payment."));
    }
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("message" => "Error recording payment: " . $e->getMessage()));
}
?>
