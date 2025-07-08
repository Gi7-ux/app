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

// Start a transaction
$db->beginTransaction();

try {
    // Store old values for comparison
    $old_amount = $existingPayment['amount'];
    $old_project_id = $existingPayment['project_id'];
    $old_paid_by_user_id = $existingPayment['paid_by_user_id'];
    $old_paid_to_user_id = $existingPayment['paid_to_user_id'];

    // Determine new values (if provided in request, otherwise use old values)
    $new_amount = isset($request_data->amount) ? htmlspecialchars(strip_tags($request_data->amount)) : $old_amount;
    $new_project_id = isset($request_data->project_id) ? htmlspecialchars(strip_tags($request_data->project_id)) : $old_project_id;
    $new_paid_by_user_id = isset($request_data->paid_by_user_id) ? htmlspecialchars(strip_tags($request_data->paid_by_user_id)) : $old_paid_by_user_id;
    $new_paid_to_user_id = isset($request_data->paid_to_user_id) ? htmlspecialchars(strip_tags($request_data->paid_to_user_id)) : $old_paid_to_user_id;

    // Execute the payment update
    if (!$stmt->execute($params)) {
        throw new Exception("Failed to update payment record.");
    }

    // Calculate amount difference if amount changed
    $amount_difference = $new_amount - $old_amount;

    // Adjust project total_paid_amount
    if ($old_project_id != $new_project_id) {
        // Remove old amount from old project
        if ($old_project_id) {
            $updateProjectQuery = "UPDATE projects SET total_paid_amount = total_paid_amount - :old_amount WHERE id = :old_project_id";
            $updateProjectStmt = $db->prepare($updateProjectQuery);
            $updateProjectStmt->bindParam(':old_amount', $old_amount);
            $updateProjectStmt->bindParam(':old_project_id', $old_project_id);
            if (!$updateProjectStmt->execute()) {
                throw new Exception("Failed to update old project's total_paid_amount.");
            }
        }
        // Add new amount to new project
        if ($new_project_id) {
            $updateProjectQuery = "UPDATE projects SET total_paid_amount = total_paid_amount + :new_amount WHERE id = :new_project_id";
            $updateProjectStmt = $db->prepare($updateProjectQuery);
            $updateProjectStmt->bindParam(':new_amount', $new_amount);
            $updateProjectStmt->bindParam(':new_project_id', $new_project_id);
            if (!$updateProjectStmt->execute()) {
                throw new Exception("Failed to update new project's total_paid_amount.");
            }
        }
    } elseif ($amount_difference != 0 && $new_project_id) {
        // Only amount changed for the same project
        $updateProjectQuery = "UPDATE projects SET total_paid_amount = total_paid_amount + :amount_difference WHERE id = :project_id";
        $updateProjectStmt = $db->prepare($updateProjectQuery);
        $updateProjectStmt->bindParam(':amount_difference', $amount_difference);
        $updateProjectStmt->bindParam(':project_id', $new_project_id);
        if (!$updateProjectStmt->execute()) {
            throw new Exception("Failed to adjust project's total_paid_amount.");
        }
    }

    // Adjust user total_spent (paid_by_user_id)
    if ($old_paid_by_user_id != $new_paid_by_user_id) {
        // Remove old amount from old paid_by_user
        if ($old_paid_by_user_id) {
            $updateUserQuery = "UPDATE users SET total_spent = total_spent - :old_amount WHERE id = :old_user_id";
            $updateUserStmt = $db->prepare($updateUserQuery);
            $updateUserStmt->bindParam(':old_amount', $old_amount);
            $updateUserStmt->bindParam(':old_user_id', $old_paid_by_user_id);
            if (!$updateUserStmt->execute()) {
                throw new Exception("Failed to update old paid_by_user's total_spent.");
            }
        }
        // Add new amount to new paid_by_user
        if ($new_paid_by_user_id) {
            $updateUserQuery = "UPDATE users SET total_spent = total_spent + :new_amount WHERE id = :new_user_id";
            $updateUserStmt = $db->prepare($updateUserQuery);
            $updateUserStmt->bindParam(':new_amount', $new_amount);
            $updateUserStmt->bindParam(':new_user_id', $new_paid_by_user_id);
            if (!$updateUserStmt->execute()) {
                throw new Exception("Failed to update new paid_by_user's total_spent.");
            }
        }
    } elseif ($amount_difference != 0 && $new_paid_by_user_id) {
        // Only amount changed for the same paid_by_user
        $updateUserQuery = "UPDATE users SET total_spent = total_spent + :amount_difference WHERE id = :user_id";
        $updateUserStmt = $db->prepare($updateUserQuery);
        $updateUserStmt->bindParam(':amount_difference', $amount_difference);
        $updateUserStmt->bindParam(':user_id', $new_paid_by_user_id);
        if (!$updateUserStmt->execute()) {
            throw new Exception("Failed to adjust paid_by_user's total_spent.");
        }
    }

    // Adjust user total_earned (paid_to_user_id)
    if ($old_paid_to_user_id != $new_paid_to_user_id) {
        // Remove old amount from old paid_to_user
        if ($old_paid_to_user_id) {
            $updateUserQuery = "UPDATE users SET total_earned = total_earned - :old_amount WHERE id = :old_user_id";
            $updateUserStmt = $db->prepare($updateUserQuery);
            $updateUserStmt->bindParam(':old_amount', $old_amount);
            $updateUserStmt->bindParam(':old_user_id', $old_paid_to_user_id);
            if (!$updateUserStmt->execute()) {
                throw new Exception("Failed to update old paid_to_user's total_earned.");
            }
        }
        // Add new amount to new paid_to_user
        if ($new_paid_to_user_id) {
            $updateUserQuery = "UPDATE users SET total_earned = total_earned + :new_amount WHERE id = :new_user_id";
            $updateUserStmt = $db->prepare($updateUserQuery);
            $updateUserStmt->bindParam(':new_amount', $new_amount);
            $updateUserStmt->bindParam(':new_user_id', $new_paid_to_user_id);
            if (!$updateUserStmt->execute()) {
                throw new Exception("Failed to update new paid_to_user's total_earned.");
            }
        }
    } elseif ($amount_difference != 0 && $new_paid_to_user_id) {
        // Only amount changed for the same paid_to_user
        $updateUserQuery = "UPDATE users SET total_earned = total_earned + :amount_difference WHERE id = :user_id";
        $updateUserStmt = $db->prepare($updateUserQuery);
        $updateUserStmt->bindParam(':amount_difference', $amount_difference);
        $updateUserStmt->bindParam(':user_id', $new_paid_to_user_id);
        if (!$updateUserStmt->execute()) {
            throw new Exception("Failed to adjust paid_to_user's total_earned.");
        }
    }

    // If all updates are successful, commit the transaction
    $db->commit();

    http_response_code(200);
    echo json_encode(array("message" => "Payment and related financial summaries updated successfully."));

} catch (Exception $e) {
    // If any error occurs, rollback the transaction
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("message" => "Error updating payment and financial summaries: " . $e->getMessage()));
}
?>
