<?php
// Arquivo: backend/models/User.php
class User {
    private $conn;
    private $table_name = "usuarios";

    public $id;
    public $nome_completo;
    public $email;
    public $senha;
    public $tipo_usuario;
    public $data_cadastro;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (nome_completo, email, senha, tipo_usuario) 
                 VALUES (:nome_completo, :email, :senha, :tipo_usuario)";
        
        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nome_completo = htmlspecialchars(strip_tags($this->nome_completo));
        $this->email = htmlspecialchars(strip_tags($this->email));
        
        // Hash da senha
        $this->senha = password_hash($this->senha, PASSWORD_DEFAULT);
        
        // Tipo de usuário padrão
        $this->tipo_usuario = 'usuario';

        // Bind values
        $stmt->bindParam(":nome_completo", $this->nome_completo);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":senha", $this->senha);
        $stmt->bindParam(":tipo_usuario", $this->tipo_usuario);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT id, nome_completo, senha, tipo_usuario 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->nome_completo = $row['nome_completo'];
            $this->senha = $row['senha'];
            $this->tipo_usuario = $row['tipo_usuario'];
            return true;
        }
        return false;
    }
}
?>