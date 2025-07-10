<?php
require_once 'config.php';

class Database {
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            $errorMsg = '[' . date('Y-m-d H:i:s') . '] Database Connection Error: ' . $e->getMessage() . "\n";
            file_put_contents(__DIR__ . '/../logs/database.log', $errorMsg, FILE_APPEND);
            throw new PDOException('Database connection failed. Check error log for details.');
        }

        return $this->conn;
    }
}
?>
