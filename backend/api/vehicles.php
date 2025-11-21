<?php
// backend/api/vehicles.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Vehicle.php';

// Definir fuso horário para Brasil
date_default_timezone_set('America/Sao_Paulo');

if (session_status() === PHP_SESSION_NONE) session_start();

$database = new Database();
$db = $database->getConnection();
$vehicle = new Vehicle($db);

// método e override para file uploads (_method)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method'])) {
    $override = strtoupper($_POST['_method']);
    if (in_array($override, ['PUT','DELETE'])) $method = $override;
}

try {
    // proteger rotas de administração
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || ($_SESSION['user_type'] ?? '') !== 'admin') {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Não autorizado."]);
        exit;
    }

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $vehicle->id = (int)$_GET['id'];
                if ($vehicle->readOne()) {
                    // garantir images como array
                    $vehicle->images = $vehicle->images ?: [];
                    echo json_encode(["success" => true, "data" => $vehicle]);
                } else {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Veículo não encontrado."]);
                }
                break;
            }

            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $destaque = isset($_GET['destaque']) ? $_GET['destaque'] : null;
            $status = isset($_GET['status']) ? $_GET['status'] : null; // ✅ NOVO FILTRO
            $offset = ($page - 1) * $limit;

            $stmt = $vehicle->readAll($offset, $limit, $destaque, $status);
            $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // decode images
            foreach ($vehicles as &$v) {
                $v['images'] = $v['images'] ? json_decode($v['images'], true) : [];
            }

            $total = $vehicle->countAll($destaque, $status);
            echo json_encode([
                "success" => true,
                "data" => [
                    "vehicles" => $vehicles,
                    "pagination" => [
                        "current_page" => $page,
                        "per_page" => $limit,
                        "total" => $total,
                        "total_pages" => ceil($total / $limit)
                    ]
                ]
            ]);
            break;

        case 'POST':
            // criar veículo (FormData com arquivos)
            $vehicle->marca = $_POST['marca'] ?? null;
            $vehicle->modelo = $_POST['modelo'] ?? null;
            $vehicle->ano = isset($_POST['ano']) ? (int)$_POST['ano'] : null;
            $vehicle->km = isset($_POST['km']) ? (int)$_POST['km'] : 0;
            $vehicle->preco = $_POST['preco'] ?? 0;
            $vehicle->status = $_POST['status'] ?? 'available';
            $vehicle->data_compra = $_POST['data_compra'] ?? null;
            $vehicle->descricao = $_POST['descricao'] ?? null;
            $vehicle->destaque = $_POST['destaque'] ?? 'nao';

            // handle uploads
            $uploaded_urls = [];
            if (!empty($_FILES['images'])) {
                $uploadDir = __DIR__ . '/../../img/vehicles/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                foreach ($_FILES['images']['tmp_name'] as $i => $tmp) {
                    if (!is_uploaded_file($tmp)) continue;
                    $ext = pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION);
                    $safe = uniqid('veh_', true) . '.' . $ext;
                    $dest = $uploadDir . $safe;
                    if (move_uploaded_file($tmp, $dest)) {
                        // URL relative para uso no frontend
                        $uploaded_urls[] = "/Apolo-Carros-projeto/img/vehicles/" . $safe;
                    }
                }
            }

            $vehicle->images = $uploaded_urls;
            if ($vehicle->create()) {
                http_response_code(201);
                echo json_encode(["success" => true, "message" => "Veículo criado.", "data" => ["id" => $vehicle->id]]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Erro ao criar veículo."]);
            }
            break;

        case 'PUT':
            // update via FormData + _method=PUT
            $id = $_POST['id'] ?? null;
            if (!$id) { 
                http_response_code(400); 
                echo json_encode(["success"=>false,"message"=>"ID necessário"]); 
                break; 
            }
            $vehicle->id = (int)$id;
            if (!$vehicle->readOne()) { 
                http_response_code(404); 
                echo json_encode(["success"=>false,"message"=>"Não encontrado"]); 
                break; 
            }

            // campos enviados
            if (isset($_POST['marca'])) $vehicle->marca = $_POST['marca'];
            if (isset($_POST['modelo'])) $vehicle->modelo = $_POST['modelo'];
            if (isset($_POST['ano'])) $vehicle->ano = (int)$_POST['ano'];
            if (isset($_POST['km'])) $vehicle->km = (int)$_POST['km'];
            if (isset($_POST['preco'])) $vehicle->preco = $_POST['preco'];
            if (isset($_POST['status'])) $vehicle->status = $_POST['status'];
            if (isset($_POST['data_compra'])) $vehicle->data_compra = $_POST['data_compra'];
            if (isset($_POST['descricao'])) $vehicle->descricao = $_POST['descricao'];
            if (isset($_POST['destaque'])) $vehicle->destaque = $_POST['destaque'];

            // imagens: se enviou novas imagens, adiciona às existentes
            $existing_images = $vehicle->images ?: [];
            $replace = isset($_POST['replace_images']) && $_POST['replace_images'] == '1';

            $uploaded_urls = [];
            if (!empty($_FILES['images'])) {
                $uploadDir = __DIR__ . '/../../img/vehicles/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                foreach ($_FILES['images']['tmp_name'] as $i => $tmp) {
                    if (!is_uploaded_file($tmp)) continue;
                    $ext = pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION);
                    $safe = uniqid('veh_', true) . '.' . $ext;
                    $dest = $uploadDir . $safe;
                    if (move_uploaded_file($tmp, $dest)) {
                        $uploaded_urls[] = "/Apolo-Carros-projeto/img/vehicles/" . $safe;
                    }
                }
            }

            // Remover imagens se especificado
            if (isset($_POST['removed_images']) && is_array($_POST['removed_images'])) {
                foreach ($_POST['removed_images'] as $removed_url) {
                    $filename = basename($removed_url);
                    $filepath = $uploadDir . $filename;
                    if (file_exists($filepath)) {
                        unlink($filepath);
                    }
                    // Remove from existing images array
                    $existing_images = array_filter($existing_images, function($url) use ($removed_url) {
                        return $url !== $removed_url;
                    });
                }
            }

            if ($replace) {
                $vehicle->images = $uploaded_urls;
            } else {
                $vehicle->images = array_merge($existing_images ?: [], $uploaded_urls);
            }

            if ($vehicle->update()) {
                echo json_encode(["success" => true, "message" => "Veículo atualizado."]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Erro ao atualizar."]);
            }
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { 
                http_response_code(400); 
                echo json_encode(["success"=>false,"message"=>"ID necessário"]); 
                break; 
            }
            $vehicle->id = (int)$id;
            if (!$vehicle->readOne()) { 
                http_response_code(404); 
                echo json_encode(["success"=>false,"message"=>"Não encontrado"]); 
                break; 
            }
            if ($vehicle->delete()) {
                echo json_encode(["success"=>true,"message"=>"Veículo excluído."]);
            } else {
                http_response_code(500); 
                echo json_encode(["success"=>false,"message"=>"Erro ao excluir."]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["success"=>false,"message"=>"Método não permitido."]);
            break;
    }
} catch (Exception $e) {
    error_log("Erro vehicles.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>"Erro interno"]);
}
?>