<?php
require_once '../core/database.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'));

if (!isset($data->project_id, $data->freelancer_id, $data->client_id, $data->hours_logged, $data->date)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}


// Insert time log
$stmt = $db->prepare("INSERT INTO time_logs (project_id, freelancer_id, client_id, hours_logged, date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $data->project_id,
    $data->freelancer_id,
    $data->client_id,
    $data->hours_logged,
    $data->date,
    $data->description ?? '',
    $data->status ?? 'approved'
]);
$time_log_id = $db->lastInsertId();

// Get freelancer rate
$rate_stmt = $db->prepare("SELECT rate FROM users WHERE id = ?");
$rate_stmt->execute([$data->freelancer_id]);
$rate = $rate_stmt->fetchColumn();
if ($rate === false) $rate = 0;

// Calculate charge
$amount = floatval($data->hours_logged) * floatval($rate);

// Insert charge record
$charge_stmt = $db->prepare("INSERT INTO charges (time_log_id, project_id, client_id, freelancer_id, hours_logged, rate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)");
$charge_stmt->execute([
    $time_log_id,
    $data->project_id,
    $data->client_id,
    $data->freelancer_id,
    $data->hours_logged,
    $rate,
    $amount
]);

http_response_code(201);
echo json_encode(["message" => "Time log and billing charge added successfully", "charge_amount" => $amount]);
