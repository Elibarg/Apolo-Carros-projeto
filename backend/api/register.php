<?php
// Arquivo: api/register.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Log para debug
error_log("Register API chamada");

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não permitido"]);
    exit;
}

include_once '../config/database.php';
include_once '../models/User.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Não foi possível conectar ao banco de dados");
    }

    $user = new User($db);

    // Obter dados do POST
    $input = file_get_contents("php://input");
    error_log("Dados recebidos: " . $input);
    
    $data = json_decode($input);

    if (!$data) {
        throw new Exception("Dados JSON inválidos");
    }

    // Validar dados obrigatórios
    if (empty($data->nome_completo) || empty($data->email) || empty($data->senha)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Todos os campos são obrigatórios"]);
        exit;
    }

    $user->nome_completo = $data->nome_completo;
    $user->email = $data->email;
    $user->senha = $data->senha;

    // Verificar se email já existe
    if ($user->emailExists()) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email já cadastrado"]);
        exit;
    }

    // Criar usuário
    if ($user->create()) {
        http_response_code(201);
        echo json_encode([
            "success" => true, 
            "message" => "Usuário criado com sucesso",
            "data" => [
                "id" => $user->id,
                "nome_completo" => $user->nome_completo,
                "email" => $user->email
            ]
        ]);
    } else {
        throw new Exception("Erro ao criar usuário no banco de dados");
    }

} catch (Exception $e) {
    error_log("Erro no register: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erro interno do servidor: " . $e->getMessage()
    ]);
}
?>