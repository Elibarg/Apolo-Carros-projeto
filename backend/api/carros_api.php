<?php
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

// Conexão com PDO usando seu config
require_once __DIR__ . "/../config/database.php";
$db = new Database();
$conn = $db->getConnection();

// 🔒 Se a conexão falhar, retorna erro amigável
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Erro ao conectar ao banco"]);
    exit;
}

// 📌 Filtros dinâmicos (marca, categoria, status, limite, destaque)
$limit      = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
$status     = isset($_GET['status']) ? explode(',', $_GET['status']) : ['available', 'reserved'];
$categoria  = isset($_GET['categoria']) ? $_GET['categoria'] : null;
$destaque   = isset($_GET['destaque']) ? $_GET['destaque'] : null;

// Base do SQL
$sql = "SELECT id, marca, modelo, ano, km, preco, status, data_compra, images, descricao, 
               destaque, categoria, combustivel, cambio
        FROM veiculos
        WHERE ativo = 1";

// Aplicar filtros dinamicamente
$params = [];

if (!empty($status)) {
    $placeholders = implode(',', array_fill(0, count($status), '?'));
    $sql .= " AND status IN ($placeholders)";
    $params = array_merge($params, $status);
}

if ($categoria) {
    $sql .= " AND categoria = ?";
    $params[] = $categoria;
}

if ($destaque) {
    $sql .= " AND destaque = ?";
    $params[] = $destaque;
}

$sql .= " ORDER BY data_cadastro DESC LIMIT $limit";

$stmt = $conn->prepare($sql);
$stmt->execute($params);

$vehicles = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    // Transformar as imagens em array
    $row['images'] = !empty($row['images']) ? json_decode($row['images'], true) : [];

    // Formatar preço
    $row['preco'] = number_format($row['preco'], 2, ',', '.');

    // Data compra NULL → vira string vazia
    $row['data_compra'] = $row['data_compra'] ?? "";

    $vehicles[] = $row;
}

// Resposta final
echo json_encode([
    "success" => true,
    "count" => count($vehicles),
    "data" => [
        "vehicles" => $vehicles
    ]
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
