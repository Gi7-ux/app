<?php
require_once '../core/database.php';
header('Content-Type: application/json');

$project_id = $_GET['project_id'] ?? null;
$client_id = $_GET['client_id'] ?? null;

$query = "SELECT * FROM purchased_hours WHERE 1=1";
$params = [];
if ($project_id) { $query .= " AND project_id = ?"; $params[] = $project_id; }
if ($client_id) { $query .= " AND client_id = ?"; $params[] = $client_id; }

$stmt = $db->prepare($query);
$stmt->execute($params);
$hours = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($hours);
