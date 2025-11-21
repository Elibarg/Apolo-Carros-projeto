<?php
// backend/models/Vehicle.php
class Vehicle {
    private $conn;
    private $table_name = "veiculos";

    public $id;
    public $marca;
    public $modelo;
    public $ano;
    public $km;
    public $preco;
    public $status;
    public $data_compra;
    public $images;
    public $descricao;
    public $destaque;
    public $data_cadastro;
    public $ativo;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar veículo
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
            (marca, modelo, ano, km, preco, status, data_compra, images, descricao, destaque) 
            VALUES (:marca, :modelo, :ano, :km, :preco, :status, :data_compra, :images, :descricao, :destaque)";
        $stmt = $this->conn->prepare($query);

        $this->marca = htmlspecialchars(strip_tags($this->marca));
        $this->modelo = htmlspecialchars(strip_tags($this->modelo));
        $this->descricao = htmlspecialchars(strip_tags($this->descricao));
        $images_json = is_array($this->images) ? json_encode(array_values($this->images)) : ($this->images ?? null);

        // Lógica de data_compra com base no status
        if ($this->status === 'sold') {
            if (!empty($this->data_compra)) {
                // Usa a data fornecida
            } else {
                $this->data_compra = date('Y-m-d');
            }
        } else {
            $this->data_compra = null;
        }

        $stmt->bindParam(":marca", $this->marca);
        $stmt->bindParam(":modelo", $this->modelo);
        $stmt->bindParam(":ano", $this->ano, PDO::PARAM_INT);
        $stmt->bindParam(":km", $this->km, PDO::PARAM_INT);
        $stmt->bindParam(":preco", $this->preco);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":data_compra", $this->data_compra);
        $stmt->bindParam(":images", $images_json);
        $stmt->bindParam(":descricao", $this->descricao);
        $stmt->bindParam(":destaque", $this->destaque);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        error_log("Erro create vehicle: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // Ler 1 veículo
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            foreach ($row as $k => $v) $this->$k = $v;
            // normalize images to array
            $this->images = $this->images ? json_decode($this->images, true) : [];
            return true;
        }
        return false;
    }

    // Listar com paginação e filtro por destaque e status
    public function readAll($from_record_num = 0, $records_per_page = 10, $destaque = null, $status = null) {
        $whereConditions = ["ativo = 1"];
        $params = [];

        if ($destaque !== null) {
            $whereConditions[] = "destaque = :destaque";
            $params[':destaque'] = $destaque;
        }
        
        if ($status !== null) {
            $whereConditions[] = "status = :status";
            $params[':status'] = $status;
        }

        $whereClause = implode(" AND ", $whereConditions);
        $query = "SELECT id, marca, modelo, ano, km, preco, status, data_compra, images, destaque, data_cadastro 
                  FROM " . $this->table_name . " 
                  WHERE $whereClause 
                  ORDER BY data_cadastro DESC 
                  LIMIT :from_record_num, :records_per_page";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind dos parâmetros
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->bindParam(":from_record_num", $from_record_num, PDO::PARAM_INT);
        $stmt->bindParam(":records_per_page", $records_per_page, PDO::PARAM_INT);
        
        $stmt->execute();
        return $stmt;
    }

    // Contar total com filtro por destaque e status
    public function countAll($destaque = null, $status = null) {
        $whereConditions = ["ativo = 1"];
        $params = [];

        if ($destaque !== null) {
            $whereConditions[] = "destaque = :destaque";
            $params[':destaque'] = $destaque;
        }
        
        if ($status !== null) {
            $whereConditions[] = "status = :status";
            $params[':status'] = $status;
        }

        $whereClause = implode(" AND ", $whereConditions);
        $query = "SELECT COUNT(*) as total_rows FROM " . $this->table_name . " WHERE $whereClause";
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        return $r ? (int)$r['total_rows'] : 0;
    }

    // Atualizar
    public function update() {
        $fields = [];
        $params = [];

        if ($this->marca !== null) { 
            $fields[] = "marca = :marca"; 
            $params[':marca'] = htmlspecialchars(strip_tags($this->marca)); 
        }
        if ($this->modelo !== null) { 
            $fields[] = "modelo = :modelo"; 
            $params[':modelo'] = htmlspecialchars(strip_tags($this->modelo)); 
        }
        if ($this->ano !== null) { 
            $fields[] = "ano = :ano"; 
            $params[':ano'] = $this->ano; 
        }
        if ($this->km !== null) { 
            $fields[] = "km = :km"; 
            $params[':km'] = $this->km; 
        }
        if ($this->preco !== null) { 
            $fields[] = "preco = :preco"; 
            $params[':preco'] = $this->preco; 
        }
        if ($this->status !== null) { 
            $fields[] = "status = :status"; 
            $params[':status'] = $this->status; 
        }
        
        // Lógica para data_compra
        if ($this->status === 'sold') {
            if (!empty($this->data_compra)) {
                $fields[] = "data_compra = :data_compra";
                $params[':data_compra'] = $this->data_compra;
            } else {
                $this->data_compra = date('Y-m-d');
                $fields[] = "data_compra = :data_compra";
                $params[':data_compra'] = $this->data_compra;
            }
        } else {
            $fields[] = "data_compra = NULL";
        }
        
        if ($this->descricao !== null) { 
            $fields[] = "descricao = :descricao"; 
            $params[':descricao'] = htmlspecialchars(strip_tags($this->descricao)); 
        }
        if ($this->images !== null) { 
            $fields[] = "images = :images"; 
            $params[':images'] = is_array($this->images) ? json_encode(array_values($this->images)) : $this->images; 
        }
        if ($this->destaque !== null) { 
            $fields[] = "destaque = :destaque"; 
            $params[':destaque'] = $this->destaque; 
        }

        if (empty($fields)) return true;

        $query = "UPDATE " . $this->table_name . " SET " . implode(", ", $fields) . ", data_atualizacao = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        foreach ($params as $k => &$v) $stmt->bindParam($k, $v);
        if ($stmt->execute()) return true;
        error_log("Erro update vehicle: " . implode(", ", $stmt->errorInfo()));
        return false;
    }

    // Delete (físico)
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>