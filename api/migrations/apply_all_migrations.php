<?php
require_once __DIR__ . '/../core/database.php';

echo "Starting all SQL migrations...\n";

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "Error: Could not connect to the database.\n";
    exit(1);
}

$migration_files = glob(__DIR__ . '/*.sql');
sort($migration_files); // Ensure migrations are run in order

foreach ($migration_files as $file) {
    $filename = basename($file);
    echo "Applying migration: " . $filename . "\n";
    $sql = file_get_contents($file);

    try {
        // Use multi_query if available, or split queries by DELIMITER
        // For simplicity, we'll assume each file is a single statement or can be run as one block
        // If files contain DELIMITER, we need to parse them.
        // For now, let's assume simple SQL files or that PDO can handle it.
        // If triggers are present, DELIMITER is used, so we need to handle it.

        // Basic parsing for DELIMITER
        $commands = array();
        $delimiter = ';';
        $buffer = '';
        foreach (explode("\n", $sql) as $line) {
            if (strpos($line, 'DELIMITER') === 0) {
                $delimiter = trim(substr($line, 9));
                if ($buffer !== '') {
                    $commands[] = $buffer;
                    $buffer = '';
                }
            } else {
                $buffer .= $line . "\n";
                if (substr(rtrim($buffer), -strlen($delimiter)) === $delimiter) {
                    $commands[] = rtrim(substr(rtrim($buffer), 0, -strlen($delimiter)));
                    $buffer = '';
                }
            }
        }
        if ($buffer !== '') {
            $commands[] = $buffer;
        }

        foreach ($commands as $command) {
            $command = trim($command);
            if (!empty($command)) {
                $db->exec($command);
            }
        }
        echo "Successfully applied " . $filename . "\n";
    } catch (PDOException $e) {
        echo "Error applying migration " . $filename . ": " . $e->getMessage() . "\n";
        // Depending on requirements, you might want to exit here or continue
        // For now, we'll continue to try other migrations but log the error.
    }
}

echo "All SQL migrations attempted.\n";

?>
