<?php
// Test the applications.php endpoint directly
require_once '../core/database.php';
require_once '../core/utils.php';
require_once '../objects/application.php';

echo "=== Testing Applications API Endpoint ===\n";

try {
    // Simulate the same request
    $_GET['project_id'] = '1';
    
    // Get database connection
    $database = new Database();
    $db = $database->connect();
    
    // Prepare application object
    $application = new Application($db);
    
    // Get project ID from query parameter
    $project_id = isset($_GET['project_id']) ? intval($_GET['project_id']) : 0;
    echo "Project ID: $project_id\n";
    
    if (!$project_id) {
        echo "ERROR: Project ID is required.\n";
        exit();
    }
    
    // Query applications
    $stmt = $application->readByProjectId($project_id);
    $num = $stmt->rowCount();
    
    echo "Number of applications found: $num\n";
    
    // Check if more than 0 record found
    if($num > 0){
        $applications_arr = array();
        $applications_arr["records"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            extract($row);
            
            $application_item = array(
                "id" => $id,
                "freelancerName" => $freelancer_name,
                "freelancerHandle" => $freelancer_handle,
                "bid" => $bid,
                "note" => $note
            );
            
            array_push($applications_arr["records"], $application_item);
        }
        
        echo "SUCCESS: Applications found\n";
        print_r($applications_arr);
    } else {
        echo "INFO: No applications found for this project.\n";
        // This would normally return 404, but that's expected behavior
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
