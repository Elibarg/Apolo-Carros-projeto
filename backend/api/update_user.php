<?php
// Arquivo: backend/api/update_user.php (VERSÃO CORRIGIDA)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// ✅ DESLIGAR ERROS HTML PARA EVITAR RESPOSTAS INVALIDAS
ini_set('display_errors', 0);
error_reporting(0);

include_once '../config/database.php';
include_once '../models/User.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Não foi possível conectar ao banco de dados");
    }

    $user = new User($db);

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    // Log para debug
    error_log("Dados recebidos para atualização: " . $input);

    if(!$data || empty($data->user_id)) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false, 
            "message" => "ID do usuário não fornecido ou dados inválidos."
        ));
        exit;
    }
    
    $user->id = $data->user_id;
    $user->email = $data->email ?? null;
    $user->nome_completo = $data->nome_completo ?? null;
    $user->data_nascimento = $data->data_nascimento ?? null;
    $user->genero = $data->genero ?? null;
    $user->cpf = $data->cpf ?? null;
    $user->cep = $data->cep ?? null;
    $user->estado = $data->estado ?? null;
    $user->cidade = $data->cidade ?? null;
    $user->endereco = $data->endereco ?? null;
    $user->telefone = $data->telefone ?? null;

    // Verificar se email já existe (excluindo o usuário atual)
    if (!empty($data->email)) {
        $checkUser = new User($db);
        $checkUser->email = $data->email;
        if ($checkUser->emailExists() && $checkUser->id != $user->id) {
            http_response_code(400);
            echo json_encode(array(
                "success" => false, 
                "message" => "Este email já está em uso por outro usuário."
            ));
            exit;
        }
    }

    if($user->update()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Dados do usuário atualizados com sucesso."
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false, 
            "message" => "Não foi possível atualizar os dados."
        ));
    }

} catch (Exception $e) {
    error_log("Erro em update_user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false, 
        "message" => "Erro interno do servidor: " . $e->getMessage()
    ));
}
?>