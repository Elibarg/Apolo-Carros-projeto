<?php
class Auth {
    private $conn;
    private $table_name = "user_sessions";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Gerar token único
    private function generateToken() {
        return bin2hex(random_bytes(32));
    }

    // Criar sessão
    public function createSession($user_id) {
        $token = $this->generateToken();
        $expires_at = date('Y-m-d H:i:s', time() + TOKEN_EXPIRY);

        $query = "INSERT INTO " . $this->table_name . " 
                 SET user_id=:user_id, token=:token, expires_at=:expires_at";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expires_at", $expires_at);

        if($stmt->execute()) {
            return $token;
        }
        return false;
    }

    // Validar token
    public function validateToken($token) {
        $query = "SELECT us.user_id, u.tipo, u.status 
                  FROM " . $this->table_name . " us
                  JOIN users u ON us.user_id = u.id
                  WHERE us.token = :token 
                  AND us.expires_at > NOW() 
                  AND u.status = 'active'
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Excluir sessão (logout)
    public function deleteSession($token) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE token = :token";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        return $stmt->execute();
    }

    // ✅ ADICIONAR: Limpar sessões expiradas
    public function cleanupExpiredSessions() {
        $query = "DELETE FROM " . $this->table_name . " WHERE expires_at <= NOW()";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute();
    }
}
?>