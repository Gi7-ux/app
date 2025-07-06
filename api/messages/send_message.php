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

$data = json_decode(file_get_contents("php://input"));

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if (!$jwt) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
    exit;
}

try {
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
    $user_id = $decoded->data->id;
    $user_role = $decoded->data->role;
    $user_name = $decoded->data->name ?? 'User'; // Fallback name

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token.", "error" => $e->getMessage()));
    exit;
}

// Validate input
if (empty($data->text)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to send message. Text is required."));
    exit;
}

$thread_id = $data->thread_id ?? null;
$project_id = $data->project_id ?? null;
$recipient_id = $data->recipient_id ?? null; // For initiating client-to-admin or direct messages
$file_id = $data->file_id ?? null; // For attaching files

try {
    // If thread_id is not provided, try to find or create one
    if (empty($thread_id)) {
        if ($project_id && $user_role === 'client') {
            // Client messaging about a project (to admin)
            // Find existing 'client_admin' thread for this project and client, or create one
            $stmt = $db->prepare("
                SELECT mt.id
                FROM message_threads mt
                JOIN message_thread_participants mtp1 ON mt.id = mtp1.thread_id AND mtp1.user_id = :client_id
                JOIN message_thread_participants mtp2 ON mt.id = mtp2.thread_id AND mtp2.user_id IN (SELECT id FROM users WHERE role = 'admin')
                WHERE mt.project_id = :project_id AND mt.type = 'client_admin'
                LIMIT 1
            ");
            $stmt->bindParam(':client_id', $user_id);
            $stmt->bindParam(':project_id', $project_id);
            $stmt->execute();
            $existing_thread = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing_thread) {
                $thread_id = $existing_thread['id'];
            } else {
                // Create 'client_admin' thread for the project
                $db->beginTransaction();
                $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (project_id, type, subject) VALUES (:project_id, 'client_admin', :subject)");
                $project_title_stmt = $db->prepare("SELECT title FROM projects WHERE id = :project_id");
                $project_title_stmt->bindParam(':project_id', $project_id);
                $project_title_stmt->execute();
                $project_title = $project_title_stmt->fetchColumn() ?: "Project $project_id";
                $subject = "Inquiry about project: " . $project_title;

                $insert_thread_stmt->bindParam(':project_id', $project_id);
                $insert_thread_stmt->bindParam(':subject', $subject);
                $insert_thread_stmt->execute();
                $thread_id = $db->lastInsertId();

                // Add client as participant
                $add_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
                $add_participant_stmt->bindParam(':thread_id', $thread_id);
                $add_participant_stmt->bindParam(':user_id', $user_id);
                $add_participant_stmt->execute();

                // Add all admins as participants
                $admin_users_stmt = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
                $admin_users_stmt->execute();
                while ($admin = $admin_users_stmt->fetch(PDO::FETCH_ASSOC)) {
                    $add_participant_stmt->bindParam(':thread_id', $thread_id);
                    $add_participant_stmt->bindParam(':user_id', $admin['id']);
                    $add_participant_stmt->execute();
                }
                $db->commit();
            }
        } elseif ($project_id && ($user_role === 'freelancer' || $user_role === 'admin')) {
            // Freelancer or Admin messaging within a project context (general project communication)
            // Find existing 'project_communication' thread or create one
            $stmt = $db->prepare("SELECT id FROM message_threads WHERE project_id = :project_id AND type = 'project_communication' LIMIT 1");
            $stmt->bindParam(':project_id', $project_id);
            $stmt->execute();
            $existing_thread = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing_thread) {
                $thread_id = $existing_thread['id'];
            } else {
                 // Fetch project details to determine participants
                $project_details_stmt = $db->prepare("SELECT client_id, freelancer_id FROM projects WHERE id = :project_id");
                $project_details_stmt->bindParam(':project_id', $project_id);
                $project_details_stmt->execute();
                $project_details = $project_details_stmt->fetch(PDO::FETCH_ASSOC);

                if (!$project_details) {
                    http_response_code(404);
                    echo json_encode(array("message" => "Project not found for creating project communication thread."));
                    exit;
                }

                $db->beginTransaction();
                $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (project_id, type, subject) VALUES (:project_id, 'project_communication', :subject)");
                $project_title_stmt = $db->prepare("SELECT title FROM projects WHERE id = :project_id");
                $project_title_stmt->bindParam(':project_id', $project_id);
                $project_title_stmt->execute();
                $project_title = $project_title_stmt->fetchColumn() ?: "Project $project_id";
                $subject = "Discussion for project: " . $project_title;

                $insert_thread_stmt->bindParam(':project_id', $project_id);
                $insert_thread_stmt->bindParam(':subject', $subject);
                $insert_thread_stmt->execute();
                $thread_id = $db->lastInsertId();

                $participants_to_add = [];
                if ($project_details['client_id']) $participants_to_add[] = $project_details['client_id'];
                if ($project_details['freelancer_id']) $participants_to_add[] = $project_details['freelancer_id'];
                
                // Add admins to project_communication threads
                $admin_users_stmt = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
                $admin_users_stmt->execute();
                while ($admin = $admin_users_stmt->fetch(PDO::FETCH_ASSOC)) {
                    if (!in_array($admin['id'], $participants_to_add)) {
                         $participants_to_add[] = $admin['id'];
                    }
                }
                
                $add_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
                foreach (array_unique($participants_to_add) as $participant_id) {
                    $add_participant_stmt->bindParam(':thread_id', $thread_id);
                    $add_participant_stmt->bindParam(':user_id', $participant_id);
                    $add_participant_stmt->execute();
                }
                $db->commit();
            }
        } else if ($recipient_id && $user_role === 'admin') { // Admin initiating direct message
            // Check for existing direct thread between admin and recipient
            $stmt = $db->prepare("
                SELECT mt.id
                FROM message_threads mt
                JOIN message_thread_participants mtp1 ON mt.id = mtp1.thread_id AND mtp1.user_id = :user_id_1
                JOIN message_thread_participants mtp2 ON mt.id = mtp2.thread_id AND mtp2.user_id = :user_id_2
                WHERE mt.type = 'direct_message' AND mt.project_id IS NULL
                AND (SELECT COUNT(DISTINCT mtp_count.user_id) FROM message_thread_participants mtp_count WHERE mtp_count.thread_id = mt.id) = 2
                LIMIT 1
            ");
            $stmt->bindParam(':user_id_1', $user_id);
            $stmt->bindParam(':user_id_2', $recipient_id);
            $stmt->execute();
            $existing_thread = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing_thread) {
                $thread_id = $existing_thread['id'];
            } else {
                $db->beginTransaction();
                $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (type, subject) VALUES ('direct_message', :subject)");
                $recipient_name_stmt = $db->prepare("SELECT name FROM users WHERE id = :recipient_id");
                $recipient_name_stmt->bindParam(':recipient_id', $recipient_id);
                $recipient_name_stmt->execute();
                $recipient_name = $recipient_name_stmt->fetchColumn() ?: "User $recipient_id";
                $subject = "Conversation with " . $recipient_name;

                $insert_thread_stmt->bindParam(':subject', $subject);
                $insert_thread_stmt->execute();
                $thread_id = $db->lastInsertId();

                $add_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
                $add_participant_stmt->bindParam(':thread_id', $thread_id);
                $add_participant_stmt->bindParam(':user_id', $user_id); // Admin
                $add_participant_stmt->execute();
                $add_participant_stmt->bindParam(':thread_id', $thread_id);
                $add_participant_stmt->bindParam(':user_id', $recipient_id); // Recipient
                $add_participant_stmt->execute();
                $db->commit();
            }
        }

        if (empty($thread_id)) {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to send message. Could not determine or create a valid message thread. Provide thread_id, or project_id (for project messages), or recipient_id (for admin direct messages)."));
            exit;
        }
    }

    // Verify user is a participant of the determined/provided thread
    $verify_stmt = $db->prepare("SELECT mt.type, mt.project_id as thread_project_id FROM message_threads mt JOIN message_thread_participants mtp ON mt.id = mtp.thread_id WHERE mtp.thread_id = :thread_id AND mtp.user_id = :user_id");
    $verify_stmt->bindParam(':thread_id', $thread_id);
    $verify_stmt->bindParam(':user_id', $user_id);
    $verify_stmt->execute();
    $thread_info = $verify_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$thread_info) {
        http_response_code(403);
        echo json_encode(array("message" => "Access denied. You are not a participant of this thread or thread does not exist."));
        exit;
    }
    $thread_type = $thread_info['type'];
    $thread_project_id = $thread_info['thread_project_id'];

    // Permission checks for project-specific threads
    if ($thread_project_id) { // This is a project-related thread
        $perm_stmt = $db->prepare("SELECT client_id, freelancer_id FROM projects WHERE id = :project_id");
        $perm_stmt->bindParam(':project_id', $thread_project_id);
        $perm_stmt->execute();
        $project_roles = $perm_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project_roles) {
            http_response_code(404);
            echo json_encode(array("message" => "Project associated with this thread not found."));
            exit;
        }

        $is_project_client = ($user_id == $project_roles['client_id']);
        $is_project_freelancer = ($user_id == $project_roles['freelancer_id']);
        $is_admin = ($user_role === 'admin');

        if (!($is_project_client || $is_project_freelancer || $is_admin)) {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. You are not part of this project's messaging channel."));
            exit;
        }

        // Client can only message admin or in project_communication (which includes admin)
        if ($user_role === 'client' && $thread_type !== 'client_admin' && $thread_type !== 'project_communication') {
             // This check might be redundant if thread creation logic is strict, but good for safety
            // Allowing client to send to project_communication as admins are part of it.
        }
    }

    // Determine message status
    $status = 'approved';
    // Example: if a freelancer sends to a 'client_admin' thread they were added to, it might need approval
    // For now, keep it simple: freelancer messages in 'project_communication' threads might be pending if project has such rules (not implemented here yet)
    // The original logic: if ($user_role === 'freelancer' && $thread_type === 'project_client_admin_freelancer') { $status = 'pending'; }
    // This specific thread type 'project_client_admin_freelancer' will be created when admin adds freelancer.
    if ($user_role === 'freelancer' && strpos($thread_type, 'client_admin') !== false) { // If freelancer is in a thread involving client and admin
        // $status = 'pending'; // Re-evaluate this based on specific workflow for "admin allowing freelancer in"
    }


    $query = "INSERT INTO messages (thread_id, sender_id, text, status, file_id) VALUES (:thread_id, :sender_id, :text, :status, :file_id)";
    $stmt = $db->prepare($query);

    $stmt->bindParam(":thread_id", $thread_id);
    $stmt->bindParam(":sender_id", $user_id);
    $stmt->bindParam(":text", $data->text);
    $stmt->bindParam(":status", $status);
    $stmt->bindParam(":file_id", $file_id, $file_id ? PDO::PARAM_INT : PDO::PARAM_NULL);


    if ($stmt->execute()) {
        $message_id = $db->lastInsertId();
        // Create notifications for all other participants in the thread
        $participants_stmt = $db->prepare("SELECT user_id FROM message_thread_participants WHERE thread_id = :thread_id AND user_id != :sender_id");
        $participants_stmt->bindParam(':thread_id', $thread_id);
        $participants_stmt->bindParam(':sender_id', $user_id);
        $participants_stmt->execute();

        $notification_query = "INSERT INTO notifications (user_id, message, link) VALUES (:user_id, :message, :link)";
        $notification_stmt = $db->prepare($notification_query);

        $message_preview = substr($data->text, 0, 50) . (strlen($data->text) > 50 ? "..." : "");
        $notification_message = "New message from {$user_name}: \"{$message_preview}\"";
        // Link could be more specific e.g., /messages?thread_id={$thread_id} or /projects/{$thread_project_id}/messages
        $link = $thread_project_id ? "/projects/{$thread_project_id}?tab=messages" : "/messages?thread_id={$thread_id}";


        while ($participant = $participants_stmt->fetch(PDO::FETCH_ASSOC)) {
            $notification_stmt->bindParam(':user_id', $participant['user_id']);
            $notification_stmt->bindParam(':message', $notification_message);
            $notification_stmt->bindParam(':link', $link);
            $notification_stmt->execute();
        }

        http_response_code(201);
        echo json_encode(array("message" => "Message sent.", "message_id" => $message_id, "thread_id" => $thread_id, "status" => $status));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to send message due to server error."));
    }

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
}

?>
