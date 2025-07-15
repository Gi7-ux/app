<?php
require_once '../core/database.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'));

if (!isset($data->project_id, $data->client_id, $data->hours_purchased, $data->purchase_date)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$stmt = $db->prepare("INSERT INTO purchased_hours (project_id, client_id, hours_purchased, purchase_date, amount) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([
    $data->project_id,
    $data->client_id,
    $data->hours_purchased,
    $data->purchase_date,
    $data->amount ?? null
]);

http_response_code(201);
echo json_encode(["message" => "Purchased hours added successfully"]);
