<?php
// Arquivo: backend/api/update_user.php (VERSÃO CORRIGIDA)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

// Log para debug
error_log("Dados recebidos para atualização: " . json_encode($data));

if(!empty($data->user_id)) {
    
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
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false, 
        "message" => "ID do usuário não fornecido."
    ));
}
?>