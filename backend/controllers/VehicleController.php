<?php
class VehicleController {
    private $db;
    private $vehicle;

    public function __construct($db) {
        $this->db = $db;
        $this->vehicle = new Vehicle($db);
    }

    // Listar veículos com filtros
    public function list($filters = []) {
        try {
            $query = "SELECT v.*, u.nome_completo as seller_name 
                     FROM vehicles v 
                     JOIN users u ON v.user_id = u.id 
                     WHERE v.status = 'active'";
            
            $params = [];

            // Aplicar filtros
            if (!empty($filters['brand']) && $filters['brand'] !== 'all') {
                $query .= " AND v.brand = :brand";
                $params[':brand'] = $filters['brand'];
            }

            if (!empty($filters['state']) && $filters['state'] !== 'all') {
                $query .= " AND v.state = :state";
                $params[':state'] = $filters['state'];
            }

            if (!empty($filters['price'])) {
                switch($filters['price']) {
                    case '0-50000':
                        $query .= " AND v.price <= 50000";
                        break;
                    case '50000-100000':
                        $query .= " AND v.price BETWEEN 50000 AND 100000";
                        break;
                    case '100000-150000':
                        $query .= " AND v.price BETWEEN 100000 AND 150000";
                        break;
                    case '150000+':
                        $query .= " AND v.price > 150000";
                        break;
                }
            }

            if (!empty($filters['transmission']) && $filters['transmission'] !== 'all') {
                $query .= " AND v.transmission = :transmission";
                $params[':transmission'] = $filters['transmission'];
            }

            $query .= " ORDER BY v.created_at DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success(['vehicles' => $vehicles]);

        } catch (Exception $e) {
            Response::error('Erro ao listar veículos: ' . $e->getMessage());
        }
    }

    // Criar veículo
    public function create($data) {
        try {
            $user_data = $this->authenticate();
            
            $required = ['brand', 'model', 'year', 'price', 'km', 'color', 'fuel_type', 'transmission', 'state', 'city'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    Response::error("Campo {$field} é obrigatório");
                }
            }

            $this->vehicle->user_id = $user_data['user_id'];
            $this->vehicle->brand = $data['brand'];
            $this->vehicle->model = $data['model'];
            $this->vehicle->year = $data['year'];
            $this->vehicle->price = $data['price'];
            $this->vehicle->km = $data['km'];
            $this->vehicle->color = $data['color'];
            $this->vehicle->fuel_type = $data['fuel_type'];
            $this->vehicle->transmission = $data['transmission'];
            $this->vehicle->description = $data['description'] ?? '';
            $this->vehicle->state = $data['state'];
            $this->vehicle->city = $data['city'];
            $this->vehicle->main_image = $data['main_image'] ?? '';

            if ($this->vehicle->create()) {
                Response::success([], 'Veículo cadastrado com sucesso');
            } else {
                Response::error('Erro ao cadastrar veículo');
            }

        } catch (Exception $e) {
            Response::error('Erro ao criar veículo: ' . $e->getMessage());
        }
    }

    // Buscar veículo por ID
    public function getById($id) {
        try {
            $this->vehicle->id = $id;
            $vehicle_data = $this->vehicle->getById();

            if ($vehicle_data) {
                // Buscar imagens do veículo
                $query = "SELECT image_path FROM vehicle_images WHERE vehicle_id = :vehicle_id";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(":vehicle_id", $id);
                $stmt->execute();
                $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $vehicle_data['images'] = $images;
                Response::success(['vehicle' => $vehicle_data]);
            } else {
                Response::notFound('Veículo não encontrado');
            }

        } catch (Exception $e) {
            Response::error('Erro ao buscar veículo: ' . $e->getMessage());
        }
    }

    // Autenticação helper
    private function authenticate() {
        $headers = getallheaders();
        $token = null;

        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            Response::unauthorized('Token de autenticação não fornecido');
        }

        $auth = new Auth($this->db);
        $user_data = $auth->validateToken($token);
        
        if (!$user_data) {
            Response::unauthorized('Token inválido ou expirado');
        }

        return $user_data;
    }
}
?>