<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../config/database.php';
require_once '../models/Vehicle.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $vehicle = new Vehicle($db);

    $method = $_SERVER['REQUEST_METHOD'];

    // ==================== GET POR ID ====================
    if ($method === 'GET' && isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $data = $vehicle->getById($id);

        if (!$data) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Veículo não encontrado']);
            exit;
        }

        $data['images'] = !empty($data['images']) ? json_decode($data['images'], true) : [];

        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    // ==================== LISTAGEM COM FILTROS ====================
    if ($method === 'GET') {
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
        $start = ($page - 1) * $limit;

        $whereConditions = ["ativo = 1"];
        $params = [];
        $paramTypes = [];

        // 🔹 Filtro por DESTAQUE
        if (isset($_GET['destaque']) && $_GET['destaque'] === 'sim') {
            $whereConditions[] = "destaque = 'sim'";
            $whereConditions[] = "status != 'sold'";
        }

        // 🔹 Filtro por marca
        if (isset($_GET['marca']) && !empty($_GET['marca'])) {
            $whereConditions[] = "marca = :marca";
            $params[':marca'] = $_GET['marca'];
            $paramTypes[':marca'] = PDO::PARAM_STR;
        }

        // 🔹 Filtro por status
        if (isset($_GET['status'])) {
            $statuses = explode(',', $_GET['status']);
            $statusPlaceholders = [];
            
            foreach ($statuses as $index => $status) {
                $placeholder = ":status_{$index}";
                $statusPlaceholders[] = $placeholder;
                $params[$placeholder] = trim($status);
                $paramTypes[$placeholder] = PDO::PARAM_STR;
            }
            
            $whereConditions[] = "status IN (" . implode(',', $statusPlaceholders) . ")";
        } else {
            // Padrão: não mostrar carros vendidos
            $whereConditions[] = "status IN ('available', 'reserved')";
        }

        // 🔹 Filtro por faixa de preço
        if (isset($_GET['preco_min']) && is_numeric($_GET['preco_min'])) {
            $whereConditions[] = "preco >= :preco_min";
            $params[':preco_min'] = floatval($_GET['preco_min']);
            $paramTypes[':preco_min'] = PDO::PARAM_STR;
        }
        
        if (isset($_GET['preco_max']) && is_numeric($_GET['preco_max'])) {
            $whereConditions[] = "preco <= :preco_max";
            $params[':preco_max'] = floatval($_GET['preco_max']);
            $paramTypes[':preco_max'] = PDO::PARAM_STR;
        }

        // Construir query WHERE
        $whereClause = "WHERE " . implode(" AND ", $whereConditions);

        // ========== EXECUTAR CONSULTA PRINCIPAL ==========
        $query = "SELECT * FROM veiculos {$whereClause} 
                  ORDER BY data_cadastro DESC
                  LIMIT :start, :limit";

        $stmt = $db->prepare($query);

        // Bind dos parâmetros
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, $paramTypes[$key] ?? PDO::PARAM_STR);
        }

        $stmt->bindValue(':start', $start, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        
        if (!$stmt->execute()) {
            throw new Exception('Erro na execução da query');
        }
        
        $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ========== CONTAGEM TOTAL ==========
        $countQuery = "SELECT COUNT(*) FROM veiculos {$whereClause}";
        $countStmt = $db->prepare($countQuery);

        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value, $paramTypes[$key] ?? PDO::PARAM_STR);
        }

        if (!$countStmt->execute()) {
            throw new Exception('Erro na contagem de veículos');
        }
        
        $total = $countStmt->fetchColumn();

        // Processar imagens
        foreach ($vehicles as &$v) {
            $v['images'] = !empty($v['images']) ? json_decode($v['images'], true) : [];
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'vehicles' => $vehicles,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => ceil($total / $limit),
                    'total_items' => $total
                ]
            ]
        ]);
        exit;
    }

    // ==================== DELETE ====================
    if ($method === 'DELETE' && isset($_GET['id'])) {
        $id = intval($_GET['id']);
        if ($vehicle->delete($id)) {
            echo json_encode(['success' => true, 'message' => 'Veículo excluído com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir veículo']);
        }
        exit;
    }

    // ==================== CREATE & UPDATE ====================
    if ($method === 'POST') {
        $data = $_POST;

        $images = [];
        if (!empty($_FILES['images']['name'][0])) {
            foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
                $ext = pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION);
                $fileName = 'veh_' . uniqid() . '.' . $ext;
                $targetPath = "../../img/vehicles/" . $fileName;
                if (move_uploaded_file($tmpName, $targetPath)) {
                    $images[] = "/Apolo-Carros-projeto/img/vehicles/" . $fileName;
                }
            }
        }

        // ======= ATUALIZAÇÃO =======
        if (isset($data['_method']) && $data['_method'] === 'PUT') {
            $existing = $vehicle->getById($data['id']);
            $existingImages = json_decode($existing['images'] ?? '[]', true);

            if (!empty($_POST['removed_images'])) {
                $removedImages = is_array($_POST['removed_images']) ? $_POST['removed_images'] : [$_POST['removed_images']];
                foreach ($removedImages as $removed) {
                    $existingImages = array_filter($existingImages, fn($img) => $img !== $removed);
                }
            }

            $data['images'] = json_encode(array_values(array_unique(array_merge($existingImages, $images))));

            if ($vehicle->update($data)) {
                echo json_encode(['success' => true, 'message' => 'Veículo atualizado com sucesso']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar veículo']);
            }
        }
        // ======= CRIAÇÃO =======
        else {
            $data['images'] = json_encode($images);
            if ($vehicle->create($data)) {
                echo json_encode(['success' => true, 'message' => 'Veículo criado com sucesso']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao criar veículo']);
            }
        }
        exit;
    }

    // ==================== MÉTODO INVÁLIDO ====================
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não suportado']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno do servidor',
        'error' => $e->getMessage()
    ]);
}