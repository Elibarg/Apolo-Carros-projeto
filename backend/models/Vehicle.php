<?php
class Vehicle {
    private $conn;
    private $table = "veiculos";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Buscar veículo por ID
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Listar veículos com paginação
    public function getAll($start, $limit) {
        $query = "SELECT * FROM {$this->table} ORDER BY data_cadastro DESC LIMIT :start, :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":start", $start, PDO::PARAM_INT);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Contar total
    public function countAll() {
        $query = "SELECT COUNT(*) FROM {$this->table}";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    // Criar veículo
    public function create($data) {
        $query = "INSERT INTO {$this->table}
            (marca, modelo, ano, km, preco, status, data_compra, descricao, destaque, categoria, combustivel, cambio, images)
            VALUES (:marca, :modelo, :ano, :km, :preco, :status, :data_compra, :descricao, :destaque, :categoria, :combustivel, :cambio, :images)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':marca', $data['marca']);
        $stmt->bindParam(':modelo', $data['modelo']);
        $stmt->bindParam(':ano', $data['ano']);
        $stmt->bindParam(':km', $data['km']);
        $stmt->bindParam(':preco', $data['preco']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':data_compra', $data['data_compra']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':destaque', $data['destaque']);
        $stmt->bindParam(':categoria', $data['categoria']);
        $stmt->bindParam(':combustivel', $data['combustivel']);
        $stmt->bindParam(':cambio', $data['cambio']);
        $stmt->bindParam(':images', $data['images']);

        return $stmt->execute();
    }

    // Atualizar veículo
    public function update($data) {
        $query = "UPDATE {$this->table} SET 
            marca = :marca,
            modelo = :modelo,
            ano = :ano,
            km = :km,
            preco = :preco,
            status = :status,
            data_compra = :data_compra,
            descricao = :descricao,
            destaque = :destaque,
            categoria = :categoria,
            combustivel = :combustivel,
            cambio = :cambio,
            images = :images
            WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':marca', $data['marca']);
        $stmt->bindParam(':modelo', $data['modelo']);
        $stmt->bindParam(':ano', $data['ano']);
        $stmt->bindParam(':km', $data['km']);
        $stmt->bindParam(':preco', $data['preco']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':data_compra', $data['data_compra']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':destaque', $data['destaque']);
        $stmt->bindParam(':categoria', $data['categoria']);
        $stmt->bindParam(':combustivel', $data['combustivel']);
        $stmt->bindParam(':cambio', $data['cambio']);
        $stmt->bindParam(':images', $data['images']);
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Deletar
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $id]);
    }
}
