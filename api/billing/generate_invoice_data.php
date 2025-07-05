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

$freelancer_id = isset($_GET['freelancer_id']) ? $_GET['freelancer_id'] : die();
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : die();
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : die();

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$arr = explode(" ", $authHeader);
$jwt = $arr[1] ?? '';

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));

        if ($decoded->data->role !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied."));
            return;
        }

        // Get freelancer details
        $freelancer_stmt = $db->prepare("SELECT name, company, email, rate FROM users WHERE id = :id");
        $freelancer_stmt->bindParam(':id', $freelancer_id);
        $freelancer_stmt->execute();
        $freelancer = $freelancer_stmt->fetch(PDO::FETCH_ASSOC);

        // Get time logs
        $logs_query = "SELECT 
                        tl.id,
                        p.title as projectName,
                        t.description as taskDescription,
                        tl.hours,
                        tl.log_date
                      FROM 
                        time_logs tl
                      JOIN
                        projects p ON tl.project_id = p.id
                      JOIN
                        tasks t ON tl.task_id = t.id
                      WHERE 
                        tl.user_id = :freelancer_id AND tl.log_date BETWEEN :start_date AND :end_date
                      ORDER BY
                        tl.log_date ASC";
        
        $logs_stmt = $db->prepare($logs_query);
        $logs_stmt->bindParam(':freelancer_id', $freelancer_id);
        $logs_stmt->bindParam(':start_date', $start_date);
        $logs_stmt->bindParam(':end_date', $end_date);
        $logs_stmt->execute();

        $logs = $logs_stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array(
            "freelancer" => $freelancer,
            "logs" => $logs
        ));

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied. No token provided."));
}
?>
