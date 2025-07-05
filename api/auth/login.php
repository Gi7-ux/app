<?php
// Allow localhost for development CORS
$allowedOrigins = ['http://localhost:5174', 'https://yourfrontenddomain.com'];
if(isset($_SERVER['HTTP_ORIGIN'])){
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin"); // Required when allowing credentials
    header("Access-Control-Allow-Headers: Content-Type");
    if(in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    }
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';
require_once '../core/utils.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

file_put_contents('../logs/debug.log', "Login Script Start\n", FILE_APPEND);
$data = json_decode(file_get_contents("php://input"));
file_put_contents('../logs/debug.log', "Request Body: " . print_r($data, true) . "\n", FILE_APPEND);

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Email and password are required."));
    return;
}

$query = "SELECT id, name, email, password, role, company, rate FROM users WHERE email = :email LIMIT 0,1";

$stmt = $db->prepare($query);
$stmt->bindParam(':email', $data->email);

try {
    $stmt->execute();
} catch (PDOException $e) {
    file_put_contents('../logs/debug.log', "PDOException: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(array("message" => "Database error."));
    return;
}

$num = $stmt->rowCount();
file_put_contents('../logs/debug.log', "Row Count: " . $num . "\n", FILE_APPEND);

if ($num > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    file_put_contents('../logs/debug.log', "User Data: " . print_r($row, true) . "\n", FILE_APPEND);
    $id = $row['id'];
    $name = $row['name'];
    $email = $row['email'];
    $password2 = $row['password'];
    $role = $row['role'];
    $company = $row['company'];
    $rate = $row['rate'];

    if (password_verify($data->password, $password2)) {
        // log_activity($db, $id, "User logged in");
        
        $issuer_claim = "YOUR_DOMAIN.com"; // this can be the servername
        $audience_claim = "THE_AUDIENCE";
        $issuedat_claim = time(); // issued at
        $notbefore_claim = $issuedat_claim; //not before in seconds
        $expire_claim = $issuedat_claim + 86400; // expire time in seconds (24 hours)

        $token = array(
            "iss" => $issuer_claim,
            "aud" => $audience_claim,
            "iat" => $issuedat_claim,
            "nbf" => $notbefore_claim,
            "exp" => $expire_claim,
            "data" => array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "role" => $role,
                "company" => $company,
                "rate" => $rate
            )
        );

        http_response_code(200);

        $jwt = JWT::encode($token, JWT_SECRET, 'HS256');
        echo json_encode(
            array(
                "message" => "Successful login.",
                "token" => $jwt,
                "email" => $email,
                "role" => $role
            )
        );
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Login failed. Incorrect password."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Login failed. User not found."));
}
?>
