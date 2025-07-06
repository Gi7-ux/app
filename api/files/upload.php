<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $uploader_id = $decoded->data->id;
        $uploader_role = $decoded->data->role;
        $uploader_name = $decoded->data->name ?? 'User';

        if (!isset($_FILES['file']) || !isset($_POST['project_id'])) {
            http_response_code(400);
            echo json_encode(array("message" => "File data or project ID is missing."));
            exit;
        }

        $project_id = (int)$_POST['project_id'];
        $file = $_FILES['file'];

        // Optional: For associating file upload with a message
        $thread_id = isset($_POST['thread_id']) ? (int)$_POST['thread_id'] : null;
        $message_text_assoc = isset($_POST['message_text']) ? trim($_POST['message_text']) : null;


        // --- Permission Check: User must be part of the project ---
        $project_check_stmt = $db->prepare("SELECT client_id, freelancer_id, title FROM projects WHERE id = :project_id");
        $project_check_stmt->bindParam(':project_id', $project_id);
        $project_check_stmt->execute();
        $project_details = $project_check_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project_details) {
            http_response_code(404);
            echo json_encode(array("message" => "Project not found."));
            exit;
        }

        $is_project_member = (
            $uploader_role === 'admin' ||
            $uploader_id == $project_details['client_id'] ||
            ($project_details['freelancer_id'] && $uploader_id == $project_details['freelancer_id'])
        );

        if (!$is_project_member) {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. You are not authorized to upload files to this project."));
            exit;
        }
        // --- End Permission Check ---

        $upload_base_dir = '../uploads/';
        // Create project-specific directory if it doesn't exist
        $project_upload_dir = $upload_base_dir . 'project_' . $project_id . '/';
        if (!is_dir($project_upload_dir)) {
            if (!mkdir($project_upload_dir, 0775, true)) {
                http_response_code(500);
                echo json_encode(array("message" => "Failed to create project upload directory. Check permissions. Path: " . $project_upload_dir));
                error_log("Failed to create directory: " . $project_upload_dir);
                exit;
            }
        }

        $file_name = preg_replace("/[^a-zA-Z0-9\._-]/", "_", basename($file['name'])); // Sanitize filename
        $target_file_path = $project_upload_dir . $file_name;
        $db_file_path = 'uploads/project_' . $project_id . '/' . $file_name; // Relative path for DB
        $file_type = strtolower(pathinfo($target_file_path, PATHINFO_EXTENSION));

        // Check if file already exists (within the project directory)
        if (file_exists($target_file_path)) {
            // Optionally, append a timestamp or number to make it unique instead of erroring
            $file_name = pathinfo($file_name, PATHINFO_FILENAME) . '_' . time() . '.' . $file_type;
            $target_file_path = $project_upload_dir . $file_name;
            $db_file_path = 'uploads/project_' . $project_id . '/' . $file_name;
        }

        // Check file size (e.g., 500MB limit) - configurable
        $max_file_size = 500 * 1024 * 1024;
        if ($file['size'] > $max_file_size) {
            http_response_code(400);
            echo json_encode(array("message" => "File is too large. Max size is " . ($max_file_size / 1024 / 1024) . "MB."));
            exit;
        }

        $db->beginTransaction();

        if (move_uploaded_file($file['tmp_name'], $target_file_path)) {
            $query = "INSERT INTO files (project_id, uploader_id, name, path, size, type) VALUES (:project_id, :uploader_id, :name, :path, :size, :type)";
            $stmt = $db->prepare($query);

            $stmt->bindParam(':project_id', $project_id);
            $stmt->bindParam(':uploader_id', $uploader_id);
            $stmt->bindParam(':name', $file_name);
            $stmt->bindParam(':path', $db_file_path); // Store relative path
            $stmt->bindParam(':size', $file['size']);
            $stmt->bindParam(':type', $file_type);

            if ($stmt->execute()) {
                $uploaded_file_id = $db->lastInsertId();
                $response_message = "File uploaded successfully.";
                $message_id_assoc = null;

                // Optional: Associate with a message if thread_id is provided
                if ($thread_id && $uploaded_file_id) {
                    $text_for_message = $message_text_assoc ?: "Shared a file: " . $file_name;

                    // Verify uploader is part of the thread
                    $verify_participant_stmt = $db->prepare("SELECT id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id = :user_id");
                    $verify_participant_stmt->bindParam(':thread_id', $thread_id);
                    $verify_participant_stmt->bindParam(':user_id', $uploader_id);
                    $verify_participant_stmt->execute();

                    if($verify_participant_stmt->fetch()){
                        $msg_insert_stmt = $db->prepare("INSERT INTO messages (thread_id, sender_id, text, file_id, status) VALUES (:thread_id, :sender_id, :text, :file_id, 'approved')");
                        $msg_insert_stmt->bindParam(':thread_id', $thread_id);
                        $msg_insert_stmt->bindParam(':sender_id', $uploader_id);
                        $msg_insert_stmt->bindParam(':text', $text_for_message);
                        $msg_insert_stmt->bindParam(':file_id', $uploaded_file_id);
                        if ($msg_insert_stmt->execute()) {
                            $message_id_assoc = $db->lastInsertId();
                            $response_message .= " Associated with message ID " . $message_id_assoc . " in thread " . $thread_id . ".";

                            // Notify message thread participants (excluding sender)
                            $participants_stmt = $db->prepare("SELECT user_id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id != :sender_id");
                            $participants_stmt->bindParam(':thread_id', $thread_id);
                            $participants_stmt->bindParam(':sender_id', $uploader_id);
                            $participants_stmt->execute();

                            $notification_msg_text = "{$uploader_name} shared a file in your chat: \"{$file_name}\"";
                            $link = "/projects/{$project_id}?tab=messages&thread_id={$thread_id}";
                            $notification_query = "INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)";
                            $notification_stmt = $db->prepare($notification_query);
                            while ($participant = $participants_stmt->fetch(PDO::FETCH_ASSOC)) {
                                $notification_stmt->bindParam(':user_id', $participant['user_id']);
                                $notification_stmt->bindParam(':message', $notification_msg_text);
                                $notification_stmt->bindParam(':link', $link);
                                $notification_stmt->execute();
                            }
                        } else {
                             error_log("Failed to create message for file upload. File ID: $uploaded_file_id, Thread ID: $thread_id");
                        }
                    } else {
                        error_log("User $uploader_id not participant of thread $thread_id. Cannot associate file $uploaded_file_id with message.");
                    }
                } else {
                    // --- Create Notifications for project members (if not already notified via message) ---
                    $project_participants_to_notify = [];
                    if ($project_details['client_id'] && $project_details['client_id'] != $uploader_id) $project_participants_to_notify[] = $project_details['client_id'];
                    if ($project_details['freelancer_id'] && $project_details['freelancer_id'] != $uploader_id) $project_participants_to_notify[] = $project_details['freelancer_id'];

                    // Notify Admins too (if they are not the uploader)
                    $admin_users_stmt = $db->prepare("SELECT id FROM users WHERE role = 'admin' AND id != :uploader_id");
                    $admin_users_stmt->bindParam(':uploader_id', $uploader_id);
                    $admin_users_stmt->execute();
                    while ($admin = $admin_users_stmt->fetch(PDO::FETCH_ASSOC)) {
                        $project_participants_to_notify[] = $admin['id'];
                    }
                    $project_participants_to_notify = array_unique($project_participants_to_notify);

                    if (!empty($project_participants_to_notify)) {
                        $notification_text = "{$uploader_name} uploaded a new file '{$file_name}' to project '{$project_details['title']}'.";
                        $link = "/projects/{$project_id}?tab=files";
                        $notify_stmt = $db->prepare("INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)");
                        foreach ($project_participants_to_notify as $p_id) {
                            $notify_stmt->bindParam(':user_id', $p_id);
                            $notify_stmt->bindParam(':message', $notification_text);
                            $notify_stmt->bindParam(':link', $link);
                            $notify_stmt->execute();
                        }
                    }
                }
                // --- End Notifications ---
                $db->commit();
                http_response_code(201);
                echo json_encode(array(
                    "message" => $response_message,
                    "file_id" => $uploaded_file_id,
                    "file_name" => $file_name,
                    "path" => $db_file_path,
                    "message_id" => $message_id_assoc // If associated with a message
                ));
            } else {
                $db->rollBack();
                http_response_code(503);
                echo json_encode(array("message" => "Failed to save file info to database."));
            }
        } else {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(array("message" => "Failed to upload file. Check server logs and upload directory permissions."));
        }
    } catch (PDOException $e) {
        if ($db->inTransaction()) $db->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Database error during file upload: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        http_response_code(401); // Or 500 for general server errors
        echo json_encode(array("message" => "An error occurred: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
