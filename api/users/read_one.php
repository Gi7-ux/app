<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/utils.php';
require_once '../migrations/run_migrations.php';

$database = new Database();
$db = $database->connect();

$data = validate_token();
$user_id = $data->id;

$query = "SELECT id, name, email, role, company, rate FROM users WHERE id = :id LIMIT 0,1";

$stmt = $db->prepare($query);
$stmt->bindParam(':id', $user_id);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($user);
?>