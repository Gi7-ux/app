<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing projects/read.php endpoint...\n\n";

require_once 'core/database.php';
require_once 'core/utils.php';

try {
    echo "1. Testing database connection...\n";
    $database = new Database();
    $db = $database->connect();
    if ($db === null) {
        die("❌ Database connection failed.\n");
    }
    echo "✅ Database connection successful\n\n";

    echo "2. Testing query...\n";
    $query = "SELECT 
                p.id, 
                p.title, 
                p.description, 
                IFNULL(c.name, c.email) as clientName, 
                CASE WHEN f.id IS NULL THEN 'Unassigned' ELSE IFNULL(f.name, f.email) END as freelancerName, 
                p.status, 
                p.budget,
                p.deadline
              FROM 
                projects p
              JOIN 
                users c ON p.client_id = c.id
              LEFT JOIN 
                users f ON p.freelancer_id = f.id";

    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $projects_arr = array();
    $projects_arr["records"] = array();

    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $count++;
        extract($row);
        $project_item = array(
            "id" => $id,
            "title" => $title,
            "description" => $description,
            "clientName" => $clientName,
            "freelancerName" => $freelancerName,
            "status" => $status,
            "budget" => $budget,
            "deadline" => $deadline
        );
        array_push($projects_arr["records"], $project_item);
    }
    
    echo "✅ Query successful - found $count projects\n";
    echo "Projects data:\n";
    echo json_encode($projects_arr, JSON_PRETTY_PRINT) . "\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
