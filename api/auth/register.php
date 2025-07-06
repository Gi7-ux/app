<?php
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core/database.php';
require_once '../core/config.php'; // For JWT_SECRET if we decide to auto-login, not used for now

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    empty($data->name) ||
    empty($data->email) ||
    empty($data->password) ||
    empty($data->role)
) {
    http_response_code(400);
    echo json_encode(array("message" => "Name, email, password, and role are required."));
    return;
}

// Validate email format
$email = filter_var($data->email, FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid email format."));
    return;
}

// Validate role
$allowed_roles = ['client', 'freelancer'];
if (!in_array($data->role, $allowed_roles)) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid role specified. Allowed roles are 'client' or 'freelancer'."));
    return;
}

// Basic password strength check (example)
if (strlen($data->password) < 8) {
    http_response_code(400);
    echo json_encode(array("message" => "Password must be at least 8 characters long."));
    return;
}

// Check if email already exists
try {
    $email_check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $email_check_stmt = $db->prepare($email_check_query);
    $email_check_stmt->bindParam(':email', $email);
    $email_check_stmt->execute();

    if ($email_check_stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "An account with this email address already exists."));
        return;
    }

    // Hash the password
    $password_hash = password_hash($data->password, PASSWORD_DEFAULT);

    // Prepare user data for insertion
    $name = htmlspecialchars(strip_tags($data->name));
    $role = $data->role;
    $company = isset($data->company) ? htmlspecialchars(strip_tags($data->company)) : null;
    // Default status is 'active' as per schema.sql for users table.
    // Other fields like phone, rate, avatar can be updated via profile management later.

    $insert_query = "INSERT INTO users (name, email, password, role, company, status)
                     VALUES (:name, :email, :password, :role, :company, 'active')";
    $insert_stmt = $db->prepare($insert_query);

    $insert_stmt->bindParam(':name', $name);
    $insert_stmt->bindParam(':email', $email);
    $insert_stmt->bindParam(':password', $password_hash);
    $insert_stmt->bindParam(':role', $role);
    $insert_stmt->bindParam(':company', $company);

    if ($insert_stmt->execute()) {
        $user_id = $db->lastInsertId();
        // Optional: Send verification email (out of scope for this implementation step)
        // Optional: Automatically log the user in by generating tokens (out of scope for this step)

        http_response_code(201);
        echo json_encode(array(
            "message" => "User registered successfully. Please log in.",
            "user_id" => $user_id
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Could not register user. Database error."));
        error_log("User registration failed: " . print_r($insert_stmt->errorInfo(), true));
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error during registration: " . $e->getMessage()));
    error_log("User registration PDOException: " . $e->getMessage());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "An error occurred during registration: " . $e->getMessage()));
    error_log("User registration Exception: " . $e->getMessage());
}

?>
