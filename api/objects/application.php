<?php
class Application {
    private $conn;
    private $table_name = "applications";

    public $id;
    public $project_id;
    public $freelancer_name;
    public $freelancer_handle;
    public $bid;
    public $note;

    public function __construct($db){
        $this->conn = $db;
    }

    function readByProjectId($project_id){
        $query = "SELECT
                    id, project_id, freelancer_name, freelancer_handle, bid, note
                FROM
                    " . $this->table_name . "
                WHERE
                    project_id = ?
                ORDER BY
                    id DESC";

        $stmt = $this->conn->prepare( $query );
        $stmt->bindParam(1, $project_id);
        $stmt->execute();

        return $stmt;
    }
}
?>
