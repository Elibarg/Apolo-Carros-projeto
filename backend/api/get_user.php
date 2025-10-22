<?php
// Arquivo: backend/api/get_user.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// ✅ DESLIGAR ERROS HTML PARA EVITAR RESPOSTAS INVALIDAS
ini_set('display_errors', 0);
error_reporting(0);

// ✅ INICIAR SESSÃO
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once '../config/database.php';
include_once '../models/User.php';

try {
    // ✅ VERIFICAR SE USUÁRIO ESTÁ LOGADO
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(array(
            "success" => false, 
            "message" => "Usuário não autenticado."
        ));
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Não foi possível conectar ao banco de dados");
    }

    $user = new User($db);

    // ✅ USAR ID DA SESSÃO
    $user->id = $_SESSION['user_id'];
    
    // ✅ BUSCAR DADOS COMPLETOS DO USUÁRIO
    if ($user->readOne()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => array(
                "id" => $user->id,
                "nome_completo" => $user->nome_completo,
                "email" => $user->email,
                "tipo_usuario" => $user->tipo_usuario,
                "avatar_url" => $user->avatar_url,
                "data_nascimento" => $user->data_nascimento,
                "genero" => $user->genero,
                "cpf" => $user->cpf,
                "cep" => $user->cep,
                "estado" => $user->estado,
                "cidade" => $user->cidade,
                "endereco" => $user->endereco,
                "telefone" => $user->telefone,
                "data_cadastro" => $user->data_cadastro
            )
        ));
    } else {
        http_response_code(404);
        echo json_encode(array(
            "success" => false, 
            "message" => "Usuário não encontrado."
        ));
    }

} catch (Exception $e) {
    error_log("Erro em get_user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false, 
        "message" => "Erro interno do servidor: " . $e->getMessage()
    ));
}
?>