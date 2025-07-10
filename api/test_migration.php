<?php
require_once 'migrations/run_migrations.php';

echo "Running critical migrations...\n";
$result = run_critical_migrations();

if ($result) {
    echo "✓ Migrations completed successfully\n";
} else {
    echo "✗ Migration failed\n";
}

echo "\nChecking debug log...\n";
if (file_exists('logs/debug.log')) {
    $log = file_get_contents('logs/debug.log');
    $lines = explode("\n", $log);
    $recent = array_slice($lines, -10);
    foreach ($recent as $line) {
        if (!empty(trim($line))) {
            echo $line . "\n";
        }
    }
} else {
    echo "Debug log file not found\n";
}
?>
