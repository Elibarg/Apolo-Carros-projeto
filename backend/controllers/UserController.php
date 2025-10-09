<?php
class UserController {
    private $user;
    private $db;

    public function __construct($db) {
        $this->user = new User($db);
        $this->db = $db;
    }

    // Criar usuário como administrador
    public function createUserAsAdmin($data) {
        $data = Validation::sanitizeInput($data);

        // Validar campos obrigatórios
        $required = ['nome_completo', 'email', 'cpf', 'telefone'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório");
            }
        }

        // Validar email
        if (!Validation::validateEmail($data['email'])) {
            Response::error('Email inválido');
        }

        // Validar CPF
        if (!Validation::validateCPF($data['cpf'])) {
            Response::error('CPF inválido');
        }

        // Validar telefone
        if (!Validation::validatePhone($data['telefone'])) {
            Response::error('Telefone inválido');
        }

        // Verificar se email já existe
        $this->user->email = $data['email'];
        if ($this->user->emailExists()) {
            Response::error('Email já cadastrado');
        }

        // Verificar se CPF já existe
        $this->user->cpf = $data['cpf'];
        if ($this->user->cpfExists()) {
            Response::error('CPF já cadastrado');
        }

        // Gerar senha padrão (CPF sem pontuação)
        $senhaPadrao = preg_replace('/[^0-9]/', '', $data['cpf']);
        
        // Criar usuário
        $this->user->nome_completo = $data['nome_completo'];
        $this->user->email = $data['email'];
        $this->user->senha = $senhaPadrao;
        $this->user->cpf = $data['cpf'];
        $this->user->telefone = $data['telefone'];
        $this->user->genero = $data['genero'] ?? null;
        $this->user->data_nascimento = $data['data_nascimento'] ?? null;
        $this->user->cep = $data['cep'] ?? null;
        $this->user->estado = $data['estado'] ?? null;
        $this->user->cidade = $data['cidade'] ?? null;
        $this->user->endereco = $data['endereco'] ?? null;
        $this->user->numero = $data['numero'] ?? null;
        $this->user->complemento = $data['complemento'] ?? null;
        $this->user->tipo = $data['tipo'] ?? 'user';
        $this->user->status = 'active';

        if ($this->user->create()) {
            Response::success([
                'senha_gerada' => $senhaPadrao
            ], 'Usuário criado com sucesso. Senha padrão: ' . $senhaPadrao);
        } else {
            Response::error('Erro ao criar usuário');
        }
    }

    // Buscar perfil do usuário
    public function getProfile($user_id) {
        $this->user->id = $user_id;
        $user_data = $this->user->getById();

        if ($user_data) {
            unset($user_data['senha']);
            Response::success(['user' => $user_data]);
        } else {
            Response::notFound('Usuário não encontrado');
        }
    }

    // Atualizar perfil
    public function updateProfile($user_id, $data) {
        $data = Validation::sanitizeInput($data);

        if (isset($data['telefone']) && !Validation::validatePhone($data['telefone'])) {
            Response::error('Telefone inválido');
        }

        if (isset($data['cep']) && !Validation::validateCEP($data['cep'])) {
            Response::error('CEP inválido');
        }

        $this->user->id = $user_id;
        $this->user->nome_completo = $data['nome_completo'] ?? null;
        $this->user->telefone = $data['telefone'] ?? null;
        $this->user->genero = $data['genero'] ?? null;
        $this->user->data_nascimento = $data['data_nascimento'] ?? null;
        $this->user->cep = $data['cep'] ?? null;
        $this->user->estado = $data['estado'] ?? null;
        $this->user->cidade = $data['cidade'] ?? null;
        $this->user->endereco = $data['endereco'] ?? null;
        $this->user->numero = $data['numero'] ?? null;
        $this->user->complemento = $data['complemento'] ?? null;

        if ($this->user->update()) {
            Response::success([], 'Perfil atualizado com sucesso');
        } else {
            Response::error('Erro ao atualizar perfil');
        }
    }

    // Listar todos os usuários (apenas admin)
    public function getAllUsers($filters = []) {
        $query = "SELECT id, nome_completo, email, cpf, telefone, tipo, status, created_at 
                  FROM users 
                  WHERE 1=1";
        
        $params = [];

        if (!empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['tipo'])) {
            $query .= " AND tipo = :tipo";
            $params[':tipo'] = $filters['tipo'];
        }

        if (!empty($filters['search'])) {
            $query .= " AND (nome_completo LIKE :search OR email LIKE :search OR cpf LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $query .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::success(['users' => $users]);
    }

    // Buscar usuário por ID (apenas admin)
    public function getUserById($id) {
        $this->user->id = $id;
        $user_data = $this->user->getById();

        if ($user_data) {
            unset($user_data['senha']);
            Response::success(['user' => $user_data]);
        } else {
            Response::notFound('Usuário não encontrado');
        }
    }

    // Atualizar status do usuário (apenas admin)
    public function updateStatus($id, $status) {
        $validStatus = ['active', 'inactive'];
        if (!in_array($status, $validStatus)) {
            Response::error('Status inválido');
        }

        $query = "UPDATE users SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            Response::success([], 'Status atualizado com sucesso');
        } else {
            Response::error('Erro ao atualizar status');
        }
    }

    // Atualizar tipo do usuário (apenas admin)
    public function updateType($id, $tipo) {
        $validTypes = ['user', 'admin'];
        if (!in_array($tipo, $validTypes)) {
            Response::error('Tipo inválido');
        }

        $query = "UPDATE users SET tipo = :tipo WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":tipo", $tipo);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            Response::success([], 'Tipo de usuário atualizado com sucesso');
        } else {
            Response::error('Erro ao atualizar tipo de usuário');
        }
    }

    // Resetar senha do usuário (apenas admin)
    public function resetPassword($user_id, $nova_senha) {
        if (!Validation::validatePassword($nova_senha)) {
            Response::error('Senha deve ter pelo menos 6 caracteres');
        }

        $senha_hash = password_hash($nova_senha, PASSWORD_BCRYPT);

        $query = "UPDATE users SET senha = :senha WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":senha", $senha_hash);
        $stmt->bindParam(":id", $user_id);

        if ($stmt->execute()) {
            Response::success([], 'Senha resetada com sucesso');
        } else {
            Response::error('Erro ao resetar senha');
        }
    }

    // Deletar usuário (apenas admin)
    public function deleteUser($id) {
        if ($this->isLastAdmin($id)) {
            Response::error('Não é possível excluir o último administrador');
        }

        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            Response::success([], 'Usuário excluído com sucesso');
        } else {
            Response::error('Erro ao excluir usuário');
        }
    }

    // Verificar se é o último admin
    private function isLastAdmin($user_id) {
        $query = "SELECT tipo FROM users WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && $user['tipo'] === 'admin') {
            $query = "SELECT COUNT(*) as admin_count FROM users WHERE tipo = 'admin'";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['admin_count'] <= 1;
        }
        
        return false;
    }
}
?>