<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $nome_completo;
    public $email;
    public $senha;
    public $cpf;
    public $telefone;
    public $genero;
    public $data_nascimento;
    public $cep;
    public $estado;
    public $cidade;
    public $endereco;
    public $numero;
    public $complemento;
    public $tipo;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ✅ GETTER para a conexão (se necessário)
    public function getConnection() {
        return $this->conn;
    }

    // Criar usuário
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET nome_completo=:nome_completo, email=:email, senha=:senha, 
                     cpf=:cpf, telefone=:telefone, genero=:genero, data_nascimento=:data_nascimento,
                     cep=:cep, estado=:estado, cidade=:cidade, endereco=:endereco, 
                     numero=:numero, complemento=:complemento, tipo=:tipo";

        $stmt = $this->conn->prepare($query);

        // Hash da senha
        $this->senha = password_hash($this->senha, PASSWORD_BCRYPT);

        // Bind dos parâmetros
        $stmt->bindParam(":nome_completo", $this->nome_completo);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":senha", $this->senha);
        $stmt->bindParam(":cpf", $this->cpf);
        $stmt->bindParam(":telefone", $this->telefone);
        $stmt->bindParam(":genero", $this->genero);
        $stmt->bindParam(":data_nascimento", $this->data_nascimento);
        $stmt->bindParam(":cep", $this->cep);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":cidade", $this->cidade);
        $stmt->bindParam(":endereco", $this->endereco);
        $stmt->bindParam(":numero", $this->numero);
        $stmt->bindParam(":complemento", $this->complemento);
        $stmt->bindParam(":tipo", $this->tipo);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Buscar usuário por email
    public function getByEmail() {
        $query = "SELECT id, nome_completo, email, senha, tipo, status 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row;
        }
        return false;
    }

    // Buscar usuário por ID
    public function getById() {
        $query = "SELECT id, nome_completo, email, cpf, telefone, genero, 
                         data_nascimento, cep, estado, cidade, endereco, numero, 
                         complemento, tipo, status, created_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Atualizar usuário
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET nome_completo=:nome_completo, telefone=:telefone, genero=:genero, 
                     data_nascimento=:data_nascimento, cep=:cep, estado=:estado, 
                     cidade=:cidade, endereco=:endereco, numero=:numero, complemento=:complemento
                 WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":nome_completo", $this->nome_completo);
        $stmt->bindParam(":telefone", $this->telefone);
        $stmt->bindParam(":genero", $this->genero);
        $stmt->bindParam(":data_nascimento", $this->data_nascimento);
        $stmt->bindParam(":cep", $this->cep);
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":cidade", $this->cidade);
        $stmt->bindParam(":endereco", $this->endereco);
        $stmt->bindParam(":numero", $this->numero);
        $stmt->bindParam(":complemento", $this->complemento);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Verificar se email já existe
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Verificar se CPF já existe
    public function cpfExists() {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE cpf = :cpf 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cpf", $this->cpf);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
?>