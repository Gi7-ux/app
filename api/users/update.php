<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

if ($jwt) {
    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));

        if ($decoded->data->role === 'admin' || $decoded->data->id == $data->id) {
            if (!empty($data->id)) {
                // Handle avatar data if provided
                $avatarPath = null;
                if (!empty($data->avatar) && strpos($data->avatar, 'data:image') === 0) {
                    // Process base64 image data
                    $imageData = $data->avatar;
                    $imageType = 'jpg'; // Default to jpg
                    
                    if (preg_match('/data:image\/([a-zA-Z0-9]+);base64,/', $imageData, $matches)) {
                        $imageType = $matches[1];
                    }
                    
                    // Remove the data:image/...; prefix
                    $imageData = preg_replace('/data:image\/[a-zA-Z0-9]+;base64,/', '', $imageData);
                    $imageData = base64_decode($imageData);
                    
                    if ($imageData !== false) {
                        // Create uploads directory if it doesn't exist
                        $uploadDir = '../uploads/avatars/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0755, true);
                        }
                        
                        // Generate unique filename
                        $filename = 'avatar_' . $data->id . '_' . time() . '.' . $imageType;
                        $avatarPath = $uploadDir . $filename;
                        
                        if (file_put_contents($avatarPath, $imageData)) {
                            // Store relative path for database
                            $avatarPath = 'uploads/avatars/' . $filename;
                        } else {
                            $avatarPath = null;
                        }
                    }
                }
                
                // Build the update query dynamically based on provided fields
                $updateFields = [];
                $params = [':id' => $data->id];
                
                if (isset($data->name)) {
                    $updateFields[] = 'name = :name';
                    $params[':name'] = $data->name;
                }
                
                if (isset($data->phone)) {
                    $updateFields[] = 'phone = :phone';
                    $params[':phone'] = $data->phone;
                }
                
                if (isset($data->company)) {
                    $updateFields[] = 'company = :company';
                    $params[':company'] = $data->company;
                }
                
                if (isset($data->rate)) {
                    $updateFields[] = 'rate = :rate';
                    $params[':rate'] = $data->rate;
                }
                
                if (isset($data->role) && $decoded->data->role === 'admin') {
                    $updateFields[] = 'role = :role';
                    $params[':role'] = $data->role;
                }
                
                if ($avatarPath !== null) {
                    $updateFields[] = 'avatar = :avatar';
                    $params[':avatar'] = $avatarPath;
                }
                
                // Handle skills array
                if (isset($data->skills) && is_array($data->skills)) {
                    $skillsJson = json_encode($data->skills);
                    $updateFields[] = 'skills = :skills';
                    $params[':skills'] = $skillsJson;
                }
                
                if (!empty($updateFields)) {
                    $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
                    $stmt = $db->prepare($query);
                    
                    if ($stmt->execute($params)) {
                        http_response_code(200);
                        echo json_encode(array(
                            "message" => "User was updated.",
                            "avatar" => $avatarPath
                        ));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("message" => "Unable to update user."));
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(array("message" => "No valid fields to update."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Unable to update user. ID is missing."));
            }
        } else {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied."));
            return;
        }
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
