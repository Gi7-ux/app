<?php
// Create a script that will apply the fixes directly to the database schema
// This will run through API when needed

require_once __DIR__ . '/../core/utils.php';

// Function to run the migration
function apply_schema_fixes($db_connection, $log_file = null) {
    // If log_file is provided, we'll log to that file
    $log_to_file = $log_file !== null;

    // Function to log messages
    $log = function($message) use ($log_to_file, $log_file) {
        if ($log_to_file) {
            file_put_contents($log_file, $message . "\n", FILE_APPEND);
        } else {
            echo $message . "\n";
        }
    };

    // If no connection, return an error
    if (!$db_connection) {
        $log("Error: No database connection provided");
        return false;
    }

    try {
        // Begin transaction
        $db_connection->beginTransaction();

        // 1. Check and add the 'name' column to users table if needed
        try {
            if (!column_exists($db_connection, 'users', 'name')) {
                // The column doesn't exist, so add it
                $add_column_query = "ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) DEFAULT NULL";
                $db_connection->exec($add_column_query);
                $log("Added 'name' column to users table");
                
                // Now update the name field with values from username
                $update_query = "UPDATE users SET name = username WHERE name IS NULL";
                $update_stmt = $db_connection->prepare($update_query);
                $update_stmt->execute();
                $affected = $update_stmt->rowCount();
                $log("Updated $affected user records with name values");
            } else {
                $log("The 'name' column already exists in users table");
            }
        } catch (PDOException $e) {
            $log("Error checking/adding 'name' column: " . $e->getMessage());
            // Continue with other migrations even if this fails
        }

        // Commit changes
        $db_connection->commit();
        $log("Schema fixes applied successfully");
        return true;
    } catch (Exception $e) {
        // Roll back if something went wrong
        $db_connection->rollBack();
        $log("Error applying schema fixes: " . $e->getMessage());
        return false;
    }
}

// If this script is run directly, execute the migration
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    require_once __DIR__ . '/../core/database.php';
    
    echo "Starting database schema fixes...\n";
    
    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        echo "Failed to connect to the database. Check configuration.\n";
        exit(1);
    }
    
    if (apply_schema_fixes($db)) {
        echo "Schema fixes completed successfully.\n";
        exit(0);
    } else {
        echo "Failed to apply some schema fixes. Check errors above.\n";
        exit(1);
    }
}
?>
