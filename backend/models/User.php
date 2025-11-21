<?php
// Arquivo: backend/models/User.php
class User {
    private $conn;
    private $table_name = "usuarios";

    // Propriedades do usuário
    public $id;
    public $nome_completo;
    public $email;
    public $senha;
    public $tipo_usuario;
    public $avatar_url;
    public $data_nascimento;
    public $genero;
    public $cpf;
    public $cep;
    public $estado;
    public $cidade;
    public $endereco;
    public $bairro;
    public $telefone;
    public $data_cadastro;
    public $data_atualizacao;
    public $ativo;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar novo usuário
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (nome_completo, email, senha, tipo_usuario, data_nascimento, genero, cpf, cep, estado, cidade, endereco, bairro, telefone) 
                 VALUES (:nome_completo, :email, :senha, :tipo_usuario, :data_nascimento, :genero, :cpf, :cep, :estado, :cidade, :endereco, :bairro, :telefone)";
        
        $stmt = $this->conn->prepare($query);

        // Sanitizar dados
        $this->nome_completo = htmlspecialchars(strip_tags($this->nome_completo));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->cpf = htmlspecialchars(strip_tags($this->cpf));
        $this->cep = htmlspecialchars(strip_tags($this->cep));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->cidade = htmlspecialchars(strip_tags($this->cidade));
        $this->endereco = htmlspecialchars(strip_tags($this->endereco));
        $this->bairro = htmlspecialchars(strip_tags($this->bairro));
        $this->telefone = htmlspecialchars(strip_tags($this->telefone));
        
        // Hash da senha
        $this->senha = password_hash($this->senha, PASSWORD_DEFAULT);
        
        // Tipo de usuário padrão
        if (empty($this->tipo_usuario)) {
            $this->tipo_usuario = 'usuario';
        }

        // Bind values
        $stmt->bindParam(":nome_completo", $this->nome_completo);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":senha", $this->senha);
        $stmt->bindParam(":tipo_usuario", $this->tipo_usuario);
        $stmt->bindParam(":data_nascimento", $this->data_nascimento);
        $stmt->bindParam(":genero", $this->genero);
        $stmt->bindParam(":cpf", $this->cpf);
        $stmt->bindParam(":cep", $this->cep);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":cidade", $this->cidade);
        $stmt->bindParam(":endereco", $this->endereco);
        $stmt->bindParam(":bairro", $this->bairro);
        $stmt->bindParam(":telefone", $this->telefone);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        error_log("❌ Erro ao criar usuário: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // Verificar se email existe
    public function emailExists() {
        $query = "SELECT id, nome_completo, senha, tipo_usuario, avatar_url, data_nascimento, genero, cpf, cep, estado, cidade, endereco, bairro, telefone 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id = $row['id'];
            $this->nome_completo = $row['nome_completo'];
            $this->senha = $row['senha'];
            $this->tipo_usuario = $row['tipo_usuario'];
            $this->avatar_url = $row['avatar_url'];
            $this->data_nascimento = $row['data_nascimento'];
            $this->genero = $row['genero'];
            $this->cpf = $row['cpf'];
            $this->cep = $row['cep'];
            $this->estado = $row['estado'];
            $this->cidade = $row['cidade'];
            $this->endereco = $row['endereco'];
            $this->bairro = $row['bairro'];
            $this->telefone = $row['telefone'];
            
            return true;
        }
        return false;
    }

    // Atualizar usuário
    public function update() {
        try {
            error_log("🔧 [update] Iniciando atualização para usuário ID: " . $this->id);
            
            $fields = [];
            $params = [':id' => $this->id];
            
            // Campos do formulário
            if ($this->nome_completo !== null) {
                $fields[] = "nome_completo = :nome_completo";
                $params[':nome_completo'] = htmlspecialchars(strip_tags($this->nome_completo));
            }
            
            if ($this->email !== null) {
                $fields[] = "email = :email";
                $params[':email'] = htmlspecialchars(strip_tags($this->email));
            }
            
            if ($this->telefone !== null) {
                $fields[] = "telefone = :telefone";
                $params[':telefone'] = htmlspecialchars(strip_tags($this->telefone));
            }

            // Atualizar senha se fornecida
            if ($this->senha !== null && !empty($this->senha)) {
                $fields[] = "senha = :senha";
                $params[':senha'] = password_hash($this->senha, PASSWORD_DEFAULT);
            }
            
            // Campos adicionais
            if ($this->tipo_usuario !== null) {
                $fields[] = "tipo_usuario = :tipo_usuario";
                $params[':tipo_usuario'] = $this->tipo_usuario;
            }
            
            if ($this->data_nascimento !== null) {
                $fields[] = "data_nascimento = :data_nascimento";
                $params[':data_nascimento'] = $this->data_nascimento;
            }
            
            if ($this->genero !== null) {
                $fields[] = "genero = :genero";
                $params[':genero'] = $this->genero;
            }
            
            if ($this->cpf !== null) {
                $fields[] = "cpf = :cpf";
                $params[':cpf'] = htmlspecialchars(strip_tags($this->cpf));
            }
            
            if ($this->cep !== null) {
                $fields[] = "cep = :cep";
                $params[':cep'] = htmlspecialchars(strip_tags($this->cep));
            }
            
            if ($this->endereco !== null) {
                $fields[] = "endereco = :endereco";
                $params[':endereco'] = htmlspecialchars(strip_tags($this->endereco));
            }
            
            if ($this->bairro !== null) {
                $fields[] = "bairro = :bairro";
                $params[':bairro'] = htmlspecialchars(strip_tags($this->bairro));
            }
            
            if ($this->cidade !== null) {
                $fields[] = "cidade = :cidade";
                $params[':cidade'] = htmlspecialchars(strip_tags($this->cidade));
            }
            
            if ($this->estado !== null) {
                $fields[] = "estado = :estado";
                $params[':estado'] = htmlspecialchars(strip_tags($this->estado));
            }
            
            // Sempre atualizar data_atualizacao
            $fields[] = "data_atualizacao = CURRENT_TIMESTAMP";
            
            if (empty($fields)) {
                error_log("ℹ️ [update] Nenhum campo para atualizar");
                return true;
            }
            
            $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE id = :id";
            
            error_log("📝 [update] Query: " . $query);
            
            $stmt = $this->conn->prepare($query);
            
            // Bind dos parâmetros
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $result = $stmt->execute();
            
            if ($result) {
                error_log("✅ [update] Atualização bem-sucedida para usuário ID: " . $this->id);
                return true;
            } else {
                $errorInfo = $stmt->errorInfo();
                error_log("❌ [update] Erro na execução: " . implode(" | ", $errorInfo));
                return false;
            }
            
        } catch (Exception $e) {
            error_log("💥 [update] Exception: " . $e->getMessage());
            return false;
        }
    }

    // Buscar usuário por ID
    public function readOne() {
        try {
            if (empty($this->id)) {
                return false;
            }

            $query = "SELECT id, nome_completo, email, tipo_usuario, avatar_url, data_nascimento, genero, cpf, cep, estado, cidade, endereco, bairro, telefone, data_cadastro 
                      FROM " . $this->table_name . " 
                      WHERE id = :id 
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(":id", $this->id, PDO::PARAM_INT);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                $this->id = $row['id'];
                $this->nome_completo = $row['nome_completo'] ?? null;
                $this->email = $row['email'] ?? null;
                $this->tipo_usuario = $row['tipo_usuario'] ?? null;
                $this->avatar_url = $row['avatar_url'] ?? null;
                $this->data_nascimento = $row['data_nascimento'] ?? null;
                $this->genero = $row['genero'] ?? null;
                $this->cpf = $row['cpf'] ?? null;
                $this->cep = $row['cep'] ?? null;
                $this->estado = $row['estado'] ?? null;
                $this->cidade = $row['cidade'] ?? null;
                $this->endereco = $row['endereco'] ?? null;
                $this->bairro = $row['bairro'] ?? null;
                $this->telefone = $row['telefone'] ?? null;
                $this->data_cadastro = $row['data_cadastro'] ?? null;
                
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            error_log("Erro readOne: " . $e->getMessage());
            return false;
        }
    }

    // Atualizar avatar
    public function updateAvatar($avatar_url) {
        $query = "UPDATE " . $this->table_name . " 
                  SET avatar_url = :avatar_url,
                      data_atualizacao = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":avatar_url", $avatar_url);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Verificar se CPF já existe
    public function cpfExists() {
        $query = "SELECT id 
                  FROM " . $this->table_name . " 
                  WHERE cpf = :cpf 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cpf", $this->cpf);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    // Buscar usuários por estado
    public function readByState($estado) {
        $query = "SELECT id, nome_completo, email, cidade, telefone 
                  FROM " . $this->table_name . " 
                  WHERE estado = :estado 
                  ORDER BY nome_completo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":estado", $estado);
        $stmt->execute();

        return $stmt;
    }

    // Listar todos os usuários (para admin)
    public function readAll($from_record_num = 0, $records_per_page = 10) {
        $query = "SELECT 
                    id, 
                    nome_completo, 
                    email, 
                    tipo_usuario, 
                    telefone,
                    data_cadastro
                  FROM " . $this->table_name . "
                  ORDER BY data_cadastro DESC
                  LIMIT :from_record_num, :records_per_page";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":from_record_num", $from_record_num, PDO::PARAM_INT);
        $stmt->bindParam(":records_per_page", $records_per_page, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    // Contar total de usuários
    public function countAll() {
        $query = "SELECT COUNT(*) as total_rows 
                  FROM " . $this->table_name;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row['total_rows'];
    }

    // Excluir usuário
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            error_log("✅ Usuário ID {$this->id} EXCLUÍDO permanentemente do banco");
            return true;
        }
        
        error_log("❌ Erro ao excluir usuário ID {$this->id}: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // Buscar usuário por CPF
    public function readByCPF() {
        $query = "SELECT id, nome_completo, email, tipo_usuario, data_nascimento, cidade, estado 
                  FROM " . $this->table_name . " 
                  WHERE cpf = :cpf 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cpf", $this->cpf);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->nome_completo = $row['nome_completo'];
            $this->email = $row['email'];
            $this->tipo_usuario = $row['tipo_usuario'];
            $this->data_nascimento = $row['data_nascimento'];
            $this->cidade = $row['cidade'];
            $this->estado = $row['estado'];
            
            return true;
        }
        return false;
    }

    // Buscar usuários por cidade
    public function readByCity($cidade, $estado = null) {
        $query = "SELECT id, nome_completo, email, telefone 
                  FROM " . $this->table_name . " 
                  WHERE cidade = :cidade";
        
        if ($estado) {
            $query .= " AND estado = :estado";
        }
        
        $query .= " ORDER BY nome_completo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cidade", $cidade);
        
        if ($estado) {
            $stmt->bindParam(":estado", $estado);
        }
        
        $stmt->execute();

        return $stmt;
    }

    // Verificar se telefone já existe
    public function phoneExists() {
        $query = "SELECT id 
                  FROM " . $this->table_name . " 
                  WHERE telefone = :telefone 
                  AND id != :id
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":telefone", $this->telefone);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    // Buscar estatísticas de usuários
    public function getStats() {
        $query = "SELECT 
                    COUNT(*) as total_usuarios,
                    COUNT(CASE WHEN tipo_usuario = 'admin' THEN 1 END) as total_admins,
                    COUNT(CASE WHEN tipo_usuario = 'usuario' THEN 1 END) as total_usuarios_comuns,
                    COUNT(CASE WHEN genero = 'male' THEN 1 END) as total_masculino,
                    COUNT(CASE WHEN genero = 'female' THEN 1 END) as total_feminino,
                    COUNT(CASE WHEN genero = 'other' THEN 1 END) as total_outro,
                    COUNT(CASE WHEN genero = 'prefer_not_say' THEN 1 END) as total_nao_informado,
                    AVG(YEAR(CURRENT_DATE) - YEAR(data_nascimento)) as idade_media,
                    estado,
                    COUNT(*) as total_por_estado
                  FROM " . $this->table_name . " 
                  GROUP BY estado
                  ORDER BY total_por_estado DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Buscar usuários cadastrados recentemente
    public function getRecentUsers($limit = 5) {
        $query = "SELECT id, nome_completo, email, cidade, estado, data_cadastro 
                  FROM " . $this->table_name . " 
                  ORDER BY data_cadastro DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }
}
?>