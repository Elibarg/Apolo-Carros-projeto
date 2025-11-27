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

$database = new Database();
$db = $database->getConnection();
$vehicle = new Vehicle($db);

$method = $_SERVER['REQUEST_METHOD'];

// Criar URL para retorno público das imagens
function getImageUrl($fileName) {
    return "/Apolo-Carros-projeto/img/vehicles/" . $fileName;
}

/* =================== GET POR ID ========================= */
if ($method === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $data = $vehicle->getById($id);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Veículo não encontrado']);
        exit;
    }

    $data['images'] = !empty($data['images']) ? json_decode($data['images'], true) : [];
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

/* =================== LISTAGEM COM FILTROS ========================= */
if ($method === 'GET') {
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
    $start = ($page - 1) * $limit;

    $extraFilters = " WHERE ativo = 1 ";
    $params = [];

    if (isset($_GET['destaque']) && $_GET['destaque'] === 'sim') {
        $extraFilters .= " AND destaque = 'sim' AND status != 'sold' ";
    }
    if (isset($_GET['marca']) && !empty($_GET['marca'])) {
        $extraFilters .= " AND marca = :marca ";
        $params[':marca'] = $_GET['marca'];
    }

    // 🔹 CORREÇÃO: placeholders nomeados para o filtro status
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $statuses = explode(',', $_GET['status']);
        $statusPlaceholders = [];
        foreach ($statuses as $index => $status) {
            $placeholder = ":status$index";
            $statusPlaceholders[] = $placeholder;
            $params[$placeholder] = $status;
        }
        $extraFilters .= " AND status IN (" . implode(',', $statusPlaceholders) . ") ";
    }

    if (isset($_GET['preco_min'])) {
        $extraFilters .= " AND preco >= :preco_min ";
        $params[':preco_min'] = $_GET['preco_min'];
    }
    if (isset($_GET['preco_max'])) {
        $extraFilters .= " AND preco <= :preco_max ";
        $params[':preco_max'] = $_GET['preco_max'];
    }

    // Consulta principal
    $query = "SELECT * FROM veiculos {$extraFilters} 
              ORDER BY data_cadastro DESC
              LIMIT :start, :limit";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':start', $start, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Tratamento das imagens
    foreach ($vehicles as &$v) {
        $imgs = !empty($v['images']) ? json_decode($v['images'], true) : [];
        $v['images'] = array_map(fn($img) => getImageUrl(basename($img)), $imgs);
    }

    // Contagem total para paginação
    $countQuery = "SELECT COUNT(*) FROM veiculos {$extraFilters}";
    $countStmt = $db->prepare($countQuery);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetchColumn();

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

/* =================== DELETE ========================= */
if ($method === 'DELETE' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    if ($vehicle->delete($id)) {
        echo json_encode(['success' => true, 'message' => 'Veículo excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir veículo']);
    }
    exit;
}

/* =================== CREATE & UPDATE ========================= */
if ($method === 'POST') {
    $data = $_POST;

    $images = [];
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/Apolo-Carros-projeto/img/vehicles/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (!empty($_FILES['images']['name'][0])) {
        foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
            $ext = pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION);
            $fileName = 'veh_' . uniqid() . '.' . $ext;
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($tmpName, $targetPath)) {
                $images[] = getImageUrl($fileName);
            }
        }
    }

    // Atualização
    if (isset($data['_method']) && $data['_method'] === 'PUT') {
        $existing = $vehicle->getById($data['id']);
        $existingImages = json_decode($existing['images'] ?? '[]', true);

        if (!empty($_POST['removed_images'])) {
            foreach ($_POST['removed_images'] as $removed) {
                $existingImages = array_filter($existingImages, fn($img) => $img !== $removed);
            }
        }

        $data['images'] = json_encode(array_unique(array_merge($existingImages, $images)));

        if ($vehicle->update($data)) {
            echo json_encode(['success' => true, 'message' => 'Veículo atualizado com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar veículo']);
        }
    }
    // Criação
    else {
        $data['images'] = json_encode($images);
        if ($vehicle->create($data)) {
            echo json_encode(['success' => true, 'message' => 'Veículo criado com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao criar veículo']);
        }
    }
    exit;
}

// Método inválido
echo json_encode(['success' => false, 'message' => 'Método não suportado']);
?>
