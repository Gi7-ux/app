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
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. Invalid token.", "error" => $e->getMessage()));
    exit;
}

// Required input: type
// Optional input: project_id, participant_ids (array of user IDs)
$type = $data->type ?? null;
$project_id = $data->project_id ?? null;
$participant_ids_input = $data->participant_ids ?? []; // Ensure it's an array

if (empty($type)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thread type is required."));
    exit;
}

// Validate participant_ids contains the current user if it's not an admin creating certain types of threads
$is_self_in_participants = in_array($user_id, $participant_ids_input);

if ($type === 'direct_message' && count($participant_ids_input) !== 2) {
    http_response_code(400);
    echo json_encode(array("message" => "Direct messages require exactly two participant IDs."));
    exit;
}
if ($type === 'direct_message' && !$is_self_in_participants) {
    http_response_code(403);
    echo json_encode(array("message" => "Cannot create a direct message thread you are not a part of."));
    exit;
}


$thread_id = null;
$created = false;

try {
    $db->beginTransaction();

    if ($type === 'client_admin' && $project_id) {
        if ($user_role !== 'client' && $user_role !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only clients or admins can ensure 'client_admin' project threads."));
            $db->rollBack();
            exit;
        }
        // Client or Admin ensuring a client_admin thread for a project
        // Participants: client of the project + all admins
        $project_client_stmt = $db->prepare("SELECT client_id FROM projects WHERE id = :project_id");
        $project_client_stmt->bindParam(':project_id', $project_id);
        $project_client_stmt->execute();
        $project_client = $project_client_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project_client) {
            http_response_code(404);
            echo json_encode(array("message" => "Project not found."));
            $db->rollBack();
            exit;
        }
        $client_user_id = $project_client['client_id'];

        // Check if current user is the project client or an admin
        if ($user_role === 'client' && $user_id != $client_user_id) {
            http_response_code(403);
            echo json_encode(array("message" => "You are not the client for this project."));
            $db->rollBack();
            exit;
        }

        $admin_ids = [];
        $admin_users_stmt = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
        $admin_users_stmt->execute();
        while ($admin = $admin_users_stmt->fetch(PDO::FETCH_ASSOC)) {
            $admin_ids[] = $admin['id'];
        }

        $all_participant_ids = array_unique(array_merge([$client_user_id], $admin_ids));
        sort($all_participant_ids); // Sort to ensure consistent search

        // Try to find existing thread with these exact participants, project_id, and type
        $find_sql = "SELECT t.id FROM message_threads t ";
        $joins = "";
        $wheres = "WHERE t.project_id = :project_id AND t.type = :type ";
        $participant_count = count($all_participant_ids);

        for ($i = 0; $i < $participant_count; $i++) {
            $joins .= "JOIN message_thread_participants mtp{$i} ON t.id = mtp{$i}.thread_id AND mtp{$i}.user_id = :p_id_{$i} ";
        }
        $wheres .= "AND (SELECT COUNT(*) FROM message_thread_participants mtp_count WHERE mtp_count.thread_id = t.id) = :p_count ";

        $find_stmt = $db->prepare($find_sql . $joins . $wheres . " LIMIT 1");
        $find_stmt->bindParam(':project_id', $project_id);
        $find_stmt->bindParam(':type', $type);
        $find_stmt->bindParam(':p_count', $participant_count, PDO::PARAM_INT);
        for ($i = 0; $i < $participant_count; $i++) {
            $find_stmt->bindParam(":p_id_{$i}", $all_participant_ids[$i]);
        }
        $find_stmt->execute();
        $existing_thread = $find_stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing_thread) {
            $thread_id = $existing_thread['id'];
        } else {
            // Create it
            $project_title_stmt = $db->prepare("SELECT title FROM projects WHERE id = :project_id");
            $project_title_stmt->bindParam(':project_id', $project_id);
            $project_title_stmt->execute();
            $project_title = $project_title_stmt->fetchColumn() ?: "Project $project_id";
            $subject = "Inquiry about project: " . $project_title;

            $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (project_id, type, subject) VALUES (:project_id, :type, :subject)");
            $insert_thread_stmt->bindParam(':project_id', $project_id);
            $insert_thread_stmt->bindParam(':type', $type);
            $insert_thread_stmt->bindParam(':subject', $subject);
            $insert_thread_stmt->execute();
            $thread_id = $db->lastInsertId();

            $add_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
            foreach ($all_participant_ids as $p_id) {
                $add_participant_stmt->bindParam(':thread_id', $thread_id);
                $add_participant_stmt->bindParam(':user_id', $p_id);
                $add_participant_stmt->execute();
            }
            $created = true;
        }

    } elseif ($type === 'project_communication' && $project_id) {
        // Any project member (client, freelancer, admin) can ensure this.
        // Participants: client, freelancer (if assigned), all admins.
        $project_details_stmt = $db->prepare("SELECT client_id, freelancer_id, title FROM projects WHERE id = :project_id");
        $project_details_stmt->bindParam(':project_id', $project_id);
        $project_details_stmt->execute();
        $project = $project_details_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$project) {
            http_response_code(404); echo json_encode(array("message" => "Project not found.")); $db->rollBack(); exit;
        }

        // Check if user is part of project or admin
        $is_member = ($user_role === 'admin' || $user_id == $project['client_id'] || ($project['freelancer_id'] && $user_id == $project['freelancer_id']));
        if (!$is_member) {
            http_response_code(403); echo json_encode(array("message" => "You are not authorized for this project's communication channel.")); $db->rollBack(); exit;
        }

        $current_participants = [];
        if ($project['client_id']) $current_participants[] = $project['client_id'];
        if ($project['freelancer_id']) $current_participants[] = $project['freelancer_id'];

        $admin_users_stmt = $db->prepare("SELECT id FROM users WHERE role = 'admin'");
        $admin_users_stmt->execute();
        while ($admin = $admin_users_stmt->fetch(PDO::FETCH_ASSOC)) {
            $current_participants[] = $admin['id'];
        }
        $all_participant_ids = array_unique($current_participants);
        sort($all_participant_ids);

        // Find existing 'project_communication' thread for this project
        // (Simplified: assuming only one 'project_communication' thread per project - if multiple are possible with different subsets of participants, this logic needs adjustment)
        $find_stmt = $db->prepare("SELECT id FROM message_threads WHERE project_id = :project_id AND type = :type LIMIT 1");
        $find_stmt->bindParam(':project_id', $project_id);
        $find_stmt->bindParam(':type', $type);
        $find_stmt->execute();
        $existing_thread = $find_stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing_thread) {
            $thread_id = $existing_thread['id'];
            // Optionally: Ensure all current project members + admins are participants. Can add missing ones here.
            // For simplicity now, we assume the thread once created has its participants managed elsewhere if they change (e.g. freelancer assigned/unassigned)
        } else {
            $subject = "Discussion for project: " . ($project['title'] ?: "Project $project_id");
            $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (project_id, type, subject) VALUES (:project_id, :type, :subject)");
            $insert_thread_stmt->bindParam(':project_id', $project_id);
            $insert_thread_stmt->bindParam(':type', $type);
            $insert_thread_stmt->bindParam(':subject', $subject);
            $insert_thread_stmt->execute();
            $thread_id = $db->lastInsertId();

            $add_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
            foreach ($all_participant_ids as $p_id) {
                $add_participant_stmt->bindParam(':thread_id', $thread_id);
                $add_participant_stmt->bindParam(':user_id', $p_id);
                $add_participant_stmt->execute();
            }
            $created = true;
        }

    } elseif ($type === 'direct_message' && count($participant_ids_input) === 2) {
        // User is ensuring a direct message thread (must be one of the participants)
        $user1_id = (int)$participant_ids_input[0];
        $user2_id = (int)$participant_ids_input[1];

        if ($user1_id == $user2_id) {
             http_response_code(400); echo json_encode(array("message" => "Cannot create a direct message thread with yourself.")); $db->rollBack(); exit;
        }

        // Ensure current user is one of them
        if ($user_id != $user1_id && $user_id != $user2_id) {
             http_response_code(403); echo json_encode(array("message" => "You cannot ensure a direct message thread you are not part of.")); $db->rollBack(); exit;
        }

        // Find existing thread between these two users, type 'direct_message', project_id IS NULL
        $stmt = $db->prepare("
            SELECT mt.id
            FROM message_threads mt
            JOIN message_thread_participants mtp1 ON mt.id = mtp1.thread_id AND mtp1.user_id = :user_id_1
            JOIN message_thread_participants mtp2 ON mt.id = mtp2.thread_id AND mtp2.user_id = :user_id_2
            WHERE mt.type = 'direct_message' AND mt.project_id IS NULL
            AND (SELECT COUNT(DISTINCT mtp_count.user_id) FROM message_thread_participants mtp_count WHERE mtp_count.thread_id = mt.id) = 2
            LIMIT 1
        ");
        $stmt->bindParam(':user_id_1', $user1_id);
        $stmt->bindParam(':user_id_2', $user2_id);
        $stmt->execute();
        $existing_thread = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing_thread) {
            $thread_id = $existing_thread['id'];
        } else {
            // Create it
            $user1_name_stmt = $db->prepare("SELECT name FROM users WHERE id = :id"); $user1_name_stmt->bindParam(":id", $user1_id); $user1_name_stmt->execute(); $user1_name = $user1_name_stmt->fetchColumn();
            $user2_name_stmt = $db->prepare("SELECT name FROM users WHERE id = :id"); $user2_name_stmt->bindParam(":id", $user2_id); $user2_name_stmt->execute(); $user2_name = $user2_name_stmt->fetchColumn();
            $subject = "Conversation between {$user1_name} and {$user2_name}";

            $insert_thread_stmt = $db->prepare("INSERT INTO message_threads (type, subject) VALUES (:type, :subject)");
            $insert_thread_stmt->bindParam(':type', $type);
            $insert_thread_stmt->bindParam(':subject', $subject);
            $insert_thread_stmt->execute();
            $thread_id = $db->lastInsertId();

            $add_participant_stmt = $db->prepare("INSERT INTO message_thread_participants (thread_id, user_id) VALUES (:thread_id, :user_id)");
            $add_participant_stmt->bindParam(':thread_id', $thread_id); $add_participant_stmt->bindParam(':user_id', $user1_id); $add_participant_stmt->execute();
            $add_participant_stmt->bindParam(':thread_id', $thread_id); $add_participant_stmt->bindParam(':user_id', $user2_id); $add_participant_stmt->execute();
            $created = true;
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid thread type or parameters for ensuring thread. Supported types: 'client_admin' (with project_id), 'project_communication' (with project_id), 'direct_message' (with 2 participant_ids)."));
        $db->rollBack();
        exit;
    }

    $db->commit();
    http_response_code(200);
    echo json_encode(array("thread_id" => $thread_id, "created" => $created, "type" => $type));

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage(), "error_details" => $e->getTraceAsString()));
}
?>
