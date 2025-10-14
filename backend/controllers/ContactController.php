<?php
class ContactController {
    private $db;
    private $table_name = "contacts";

    public function __construct($db) {
        $this->db = $db;
    }

    // Enviar mensagem de contato
    public function send($data) {
        $data = Validation::sanitizeInput($data);

        $required = ['name', 'email', 'subject', 'message'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório");
            }
        }

        if (!Validation::validateEmail($data['email'])) {
            Response::error('Email inválido');
        }

        $query = "INSERT INTO " . $this->table_name . " 
                 SET name=:name, email=:email, phone=:phone, 
                     subject=:subject, message=:message";

        $stmt = $this->db->prepare($query);

        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":email", $data['email']);
        $stmt->bindParam(":phone", $data['phone'] ?? null);
        $stmt->bindParam(":subject", $data['subject']);
        $stmt->bindParam(":message", $data['message']);

        if($stmt->execute()) {
            Response::success([], 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
        } else {
            Response::error('Erro ao enviar mensagem');
        }
    }

    // Listar mensagens (apenas admin)
    public function getAll($filters = []) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR email LIKE :search OR subject LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);

        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::success(['contacts' => $contacts]);
    }

    // Atualizar status da mensagem (apenas admin)
    public function updateStatus($id, $status) {
        $validStatus = ['pending', 'answered', 'closed'];
        if (!in_array($status, $validStatus)) {
            Response::error('Status inválido');
        }

        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            Response::success([], 'Status atualizado com sucesso');
        } else {
            Response::error('Erro ao atualizar status');
        }
    }

    // Obter estatísticas de contatos
    public function getStats() {
        $query = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'answered' THEN 1 ELSE 0 END) as answered,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
        FROM " . $this->table_name;

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>