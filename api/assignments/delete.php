<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE"); // Allow DELETE as well
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../core/utils.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$decoded_token = validate_token_and_get_data();
if (!$decoded_token) {
    return;
}

if (!empty($data->id)) {
    // Optional: Add role/permission check

    // Consider implications: deleting an assignment should probably delete its tasks.
    // This can be handled by database CASCADE CONSTRAINTS or explicitly here.
    // For explicit deletion:
    // 1. Delete tasks associated with the assignment
    // 2. Delete the assignment

    $db->beginTransaction();

    try {
        // Delete associated tasks first
        $query_delete_tasks = "DELETE FROM tasks WHERE assignment_id = :assignment_id";
        $stmt_delete_tasks = $db->prepare($query_delete_tasks);
        $stmt_delete_tasks->bindParam(":assignment_id", $data->id);
        $stmt_delete_tasks->execute();

        // Then delete the assignment
        $query_delete_assignment = "DELETE FROM assignments WHERE id = :id";
        $stmt_delete_assignment = $db->prepare($query_delete_assignment);
        $data->id = htmlspecialchars(strip_tags($data->id));
        $stmt_delete_assignment->bindParam(':id', $data->id);

        if ($stmt_delete_assignment->execute()) {
            if ($stmt_delete_assignment->rowCount() > 0) {
                $db->commit();
                http_response_code(200);
                echo json_encode(array("message" => "Assignment and its tasks were deleted."));
            } else {
                $db->rollBack(); // No assignment found to delete
                http_response_code(404);
                echo json_encode(array("message" => "Assignment not found."));
            }
        } else {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete assignment."));
        }
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(array("message" => "Error during deletion: " . $e->getMessage()));
    }

} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete assignment. ID is missing."));
}
?>
