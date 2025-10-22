<?php
// Arquivo: config/database.php
class Database {
    private $host = "localhost";
    private $db_name = "apolo_carros";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8", 
                $this->username, 
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch(PDOException $exception) {
            // Retornar erro de forma mais amigável
            error_log("Erro de conexão: " . $exception->getMessage());
            return false;
        }
    }
}
?>