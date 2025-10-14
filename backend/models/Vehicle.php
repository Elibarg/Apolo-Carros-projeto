<?php
class Vehicle {
    private $conn;
    private $table_name = "vehicles";

    public $id;
    public $user_id;
    public $brand;
    public $model;
    public $year;
    public $price;
    public $km;
    public $color;
    public $fuel_type;
    public $transmission;
    public $description;
    public $state;
    public $city;
    public $status;
    public $main_image;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar veículo
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET user_id=:user_id, brand=:brand, model=:model, year=:year, 
                     price=:price, km=:km, color=:color, fuel_type=:fuel_type, 
                     transmission=:transmission, description=:description, 
                     state=:state, city=:city, main_image=:main_image";

        $stmt = $this->conn->prepare($query);

        // Bind dos parâmetros
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":brand", $this->brand);
        $stmt->bindParam(":model", $this->model);
        $stmt->bindParam(":year", $this->year);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":km", $this->km);
        $stmt->bindParam(":color", $this->color);
        $stmt->bindParam(":fuel_type", $this->fuel_type);
        $stmt->bindParam(":transmission", $this->transmission);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":state", $this->state);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":main_image", $this->main_image);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Buscar veículo por ID
    public function getById() {
        $query = "SELECT v.*, u.nome_completo as seller_name 
                  FROM " . $this->table_name . " v
                  JOIN users u ON v.user_id = u.id
                  WHERE v.id = :id 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Atualizar veículo
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                 SET brand=:brand, model=:model, year=:year, price=:price, 
                     km=:km, color=:color, fuel_type=:fuel_type, 
                     transmission=:transmission, description=:description, 
                     state=:state, city=:city, main_image=:main_image,
                     status=:status
                 WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":brand", $this->brand);
        $stmt->bindParam(":model", $this->model);
        $stmt->bindParam(":year", $this->year);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":km", $this->km);
        $stmt->bindParam(":color", $this->color);
        $stmt->bindParam(":fuel_type", $this->fuel_type);
        $stmt->bindParam(":transmission", $this->transmission);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":state", $this->state);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":main_image", $this->main_image);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Deletar veículo
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    // Verificar se veículo pertence ao usuário
    public function belongsToUser($user_id) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE id = :id AND user_id = :user_id 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
?>