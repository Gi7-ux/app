<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;


$database = new Database();
$db = $database->connect();
if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        $user_id = $decoded->data->id;

        // This query is complex due to the different thread types and participant logic.
        // In a real-world scenario, this might be handled by a more advanced ORM or multiple queries.
        $query = "SELECT 
                    t.id as thread_id, 
                    t.type, 
                    t.project_id,
                    p.title as project_title,
                    GROUP_CONCAT(u.email) as participants
                  FROM 
                    message_threads t
                  LEFT JOIN 
                    projects p ON t.project_id = p.id
                  JOIN 
                    message_thread_participants mtp ON t.id = mtp.thread_id
                  JOIN
                    users u ON mtp.user_id = u.id
                  WHERE 
                    t.id IN (SELECT thread_id FROM message_thread_participants WHERE user_id = :user_id)
                  GROUP BY
                    t.id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $threads_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            // Fetch last message for preview
            $msg_query = "SELECT text, timestamp FROM messages WHERE thread_id = :thread_id ORDER BY timestamp DESC LIMIT 1";
            $msg_stmt = $db->prepare($msg_query);
            $msg_stmt->bindParam(':thread_id', $thread_id);
            $msg_stmt->execute();
            $last_message = $msg_stmt->fetch(PDO::FETCH_ASSOC);

            $thread_item = array(
                "id" => $thread_id,
                "type" => $type,
                "projectId" => $project_id,
                "projectTitle" => $project_title,
                "participants" => explode(',', $participants),
                "lastMessage" => $last_message ? $last_message['text'] : "No messages yet.",
                "lastMessageTimestamp" => $last_message ? $last_message['timestamp'] : null,
            );
            array_push($threads_arr, $thread_item);
        }

        http_response_code(200);
        echo json_encode($threads_arr);

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array(
            "message" => "Access denied.",
            "error" => $e->getMessage()
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
