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

// ============== GET POR ID ===================
if ($method === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $data = $vehicle->getById($id);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Veículo não encontrado']);
        exit;
    }

    if (!empty($data['images'])) {
        $data['images'] = json_decode($data['images'], true);
    } else {
        $data['images'] = [];
    }

    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// ============== LISTAR (PAGE, LIMIT) ===================
if ($method === 'GET') {
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $start = ($page - 1) * $limit;

    $vehicles = $vehicle->getAll($start, $limit);
    $total = $vehicle->countAll();

    foreach ($vehicles as &$v) {
        $v['images'] = json_decode($v['images'] ?? '[]', true);
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

// ============== DELETE ===================
if ($method === 'DELETE' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    if ($vehicle->delete($id)) {
        echo json_encode(['success' => true, 'message' => 'Veículo excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir veículo']);
    }
    exit;
}

// ============== CREATE & UPDATE ===================
if ($method === 'POST') {
    $data = $_POST;

    $images = [];
    if (!empty($_FILES['images']['name'][0])) {
        foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
            $fileName = 'veh_' . uniqid() . '.' . pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION);
            $targetPath = "../../img/vehicles/" . $fileName;
            move_uploaded_file($tmpName, $targetPath);
            $images[] = "/Apolo-Carros-projeto/img/vehicles/" . $fileName;
        }
    }

    if (isset($data['_method']) && $data['_method'] === 'PUT') {
        $existing = $vehicle->getById($data['id']);
        $existingImages = json_decode($existing['images'] ?? '[]', true);

        if (!empty($_POST['removed_images'])) {
            foreach ($_POST['removed_images'] as $removed) {
                $existingImages = array_filter($existingImages, fn($img) => $img !== $removed);
            }
        }

        $finalImages = array_merge($existingImages, $images);
        $data['images'] = json_encode(array_unique($finalImages));

        if ($vehicle->update($data)) {
            echo json_encode(['success' => true, 'message' => 'Veículo atualizado com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar veículo']);
        }
    } else {
        $data['images'] = json_encode($images);
        if ($vehicle->create($data)) {
            echo json_encode(['success' => true, 'message' => 'Veículo criado com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao criar veículo']);
        }
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Método não suportado']);
