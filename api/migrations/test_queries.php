<?php
require_once '../core/database.php';
require_once '../core/utils.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "=== Testing Applications Query ===\n";
    
    // Test applications query directly
    $project_id = 1;
    $query = "SELECT id, project_id, freelancer_name, freelancer_handle, bid, note FROM applications WHERE project_id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $project_id);
    $stmt->execute();
    
    echo "Applications found for project 1: " . $stmt->rowCount() . "\n";
    
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            print_r($row);
        }
    } else {
        echo "No applications found. Let's check if project 1 exists:\n";
        
        $project_check = $db->prepare("SELECT id, title FROM projects WHERE id = ?");
        $project_check->bindParam(1, $project_id);
        $project_check->execute();
        
        if ($project_check->rowCount() > 0) {
            $project = $project_check->fetch(PDO::FETCH_ASSOC);
            echo "Project exists: " . $project['title'] . "\n";
            
            // Let's create a test application
            echo "Creating a test application...\n";
            $insert_app = $db->prepare("INSERT INTO applications (project_id, freelancer_name, freelancer_handle, bid, note) VALUES (?, ?, ?, ?, ?)");
            $insert_app->execute([1, 'John Doe', '@johndoe', 500.00, 'I am interested in this project']);
            echo "Test application created successfully!\n";
            
        } else {
            echo "Project 1 does not exist. Let's check what projects are available:\n";
            $all_projects = $db->prepare("SELECT id, title FROM projects LIMIT 5");
            $all_projects->execute();
            while ($proj = $all_projects->fetch(PDO::FETCH_ASSOC)) {
                echo "- Project {$proj['id']}: {$proj['title']}\n";
            }
        }
    }
    
    echo "\n=== Testing Projects Query ===\n";
    
    // Test the project query that's failing
    $query = "SELECT 
              p.id, 
              p.title, 
              p.description, 
              p.status, 
              p.budget, 
              p.deadline, 
              p.created_at,
              IFNULL(c.name, c.email) as clientName,
              CASE WHEN f.id IS NULL THEN 'Unassigned' ELSE IFNULL(f.name, f.email) END as freelancerName
              FROM projects p
              JOIN users c ON p.client_id = c.id
              LEFT JOIN users f ON p.freelancer_id = f.id
              WHERE p.id = ?";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $project_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "Project query successful!\n";
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        print_r($project);
    } else {
        echo "Project query failed or no results\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
