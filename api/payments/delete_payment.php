<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
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

// Only admins should be able to delete payment records.
if ($userData->role !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied. Only admins can delete payment records."));
    return;
}

// Get ID from URL parameter or request body
$payment_id = null;
if (isset($_GET['id'])) {
    $payment_id = htmlspecialchars(strip_tags($_GET['id']));
} else {
    $request_data = json_decode(file_get_contents("php://input"));
    if (isset($request_data->id)) {
        $payment_id = htmlspecialchars(strip_tags($request_data->id));
    }
}

if (!$payment_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Payment ID is required."));
    return;
}

// Before deleting, fetch the payment to get its amount and related IDs for financial summary updates
$fetchQuery = "SELECT project_id, paid_by_user_id, paid_to_user_id, amount FROM payments WHERE id = :id";
$fetchStmt = $db->prepare($fetchQuery);
$fetchStmt->bindParam(':id', $payment_id);
$fetchStmt->execute();
$paymentToDelete = $fetchStmt->fetch(PDO::FETCH_ASSOC);

if (!$paymentToDelete) {
    http_response_code(404);
    echo json_encode(array("message" => "Payment not found."));
    return;
}

$query = "DELETE FROM payments WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $payment_id);

$db->beginTransaction();

try {
    if ($stmt->execute()) {
        if ($stmt->rowCount()) {
            // Adjust financial summary columns
            $amountToAdjust = $paymentToDelete['amount'];

            if ($paymentToDelete['project_id']) {
                $updateProjectQuery = "UPDATE projects SET total_paid_amount = total_paid_amount - :amount WHERE id = :project_id";
                $updateStmt = $db->prepare($updateProjectQuery);
                $updateStmt->bindParam(':amount', $amountToAdjust);
                $updateStmt->bindParam(':project_id', $paymentToDelete['project_id']);
                $updateStmt->execute();
            }

            if ($paymentToDelete['paid_by_user_id']) {
                $updateUserSpentQuery = "UPDATE users SET total_spent_as_client = total_spent_as_client - :amount WHERE id = :user_id";
                $updateUserStmt = $db->prepare($updateUserSpentQuery);
                $updateUserStmt->bindParam(':amount', $amountToAdjust);
                $updateUserStmt->bindParam(':user_id', $paymentToDelete['paid_by_user_id']);
                $updateUserStmt->execute();
            }

            if ($paymentToDelete['paid_to_user_id']) {
                $updateUserEarnedQuery = "UPDATE users SET total_earned = total_earned - :amount WHERE id = :user_id";
                $updateUserEarnedStmt = $db->prepare($updateUserEarnedQuery);
                $updateUserEarnedStmt->bindParam(':amount', $amountToAdjust);
                $updateUserEarnedStmt->bindParam(':user_id', $paymentToDelete['paid_to_user_id']);
                $updateUserEarnedStmt->execute();
            }

            $db->commit();
            http_response_code(200);
            echo json_encode(array("message" => "Payment deleted successfully and financial summaries adjusted."));
        } else {
            $db->rollBack(); // Should not happen if fetch found the payment, but as a safeguard
            http_response_code(404); // Or 500 if something unexpected happened
            echo json_encode(array("message" => "Payment not found or already deleted."));
        }
    } else {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete payment."));
    }
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("message" => "Error deleting payment: " . $e->getMessage()));
}

?>
