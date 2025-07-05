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
            $errorMsg = 'Connection Error: ' . $e->getMessage();
            file_put_contents(__DIR__ . '/../logs/debug.log', $errorMsg . "\n", FILE_APPEND);
            echo $errorMsg;
        }

        return $this->conn;
    }
}
?>
