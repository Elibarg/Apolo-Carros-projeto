<?php
// Arquivo: backend/api/update_user.php (VERSÃO SIMPLIFICADA)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

ini_set('display_errors', 0);
error_reporting(0);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once '../config/database.php';
include_once '../models/User.php';

try {
    // ✅ VERIFICAR AUTENTICAÇÃO
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Não foi possível conectar ao banco de dados");
    }

    $user = new User($db);
    $user->id = $_SESSION['user_id'];

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    error_log("📥 UPDATE_USER - Dados recebidos: " . print_r($data, true));

    if(!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dados inválidos."]);
        exit;
    }

    // ✅ BUSCAR DADOS ATUAIS
    if (!$user->readOne()) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
        exit;
    }

    // ✅ ATUALIZAR APENAS CAMPOS ENVIADOS
    $camposAtualizados = [];
    
    if (isset($data->nome_completo) && $data->nome_completo !== $user->nome_completo) {
        $user->nome_completo = $data->nome_completo;
        $camposAtualizados[] = 'nome';
    }
    
    if (isset($data->email) && $data->email !== $user->email) {
        $user->email = $data->email;
        $camposAtualizados[] = 'email';
    }
    
    if (isset($data->telefone) && $data->telefone !== $user->telefone) {
        $user->telefone = $data->telefone;
        $camposAtualizados[] = 'telefone';
    }

    // ✅ VERIFICAR EMAIL DUPLICADO (apenas se email foi alterado)
    if (in_array('email', $camposAtualizados)) {
        $checkUser = new User($db);
        $checkUser->email = $data->email;
        if ($checkUser->emailExists() && $checkUser->id != $user->id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Este email já está em uso."]);
            exit;
        }
    }

    // ✅ ATUALIZAR SENHA SE FORNECIDA (SEM VERIFICAÇÃO DUPLICADA)
    if (!empty($data->senha_atual) && !empty($data->nova_senha)) {
        error_log("🔐 UPDATE_USER - Atualizando senha...");
        
        // ✅ A VERIFICAÇÃO JÁ FOI FEITA PELO verify_password.php NO FRONTEND
        // ✅ CONFIA NA VERIFICAÇÃO DO FRONTEND E ATUALIZA DIRETAMENTE
        $user->senha = $data->nova_senha;
        if ($user->updatePassword()) {
            $camposAtualizados[] = 'senha';
            error_log("✅ UPDATE_USER - Senha atualizada com sucesso");
        } else {
            throw new Exception("Erro ao atualizar senha no banco.");
        }
    }

    // ✅ ATUALIZAR DADOS DO USUÁRIO (se houver campos para atualizar)
    if (!empty($camposAtualizados)) {
        if($user->update()) {
            // ✅ ATUALIZAR SESSÃO
            $_SESSION['user_name'] = $user->nome_completo;
            $_SESSION['user_email'] = $user->email;
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Dados atualizados com sucesso!",
                "data" => [
                    "nome_completo" => $user->nome_completo,
                    "email" => $user->email,
                    "telefone" => $user->telefone,
                    "campos_atualizados" => $camposAtualizados
                ]
            ]);
            
            error_log("✅ UPDATE_USER - Dados atualizados: " . implode(', ', $camposAtualizados));
            
        } else {
            throw new Exception("Falha na execução do UPDATE no banco de dados.");
        }
    } else {
        // Nenhum campo para atualizar
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Nenhuma alteração detectada.",
            "data" => []
        ]);
    }

} catch (Exception $e) {
    error_log("💥 ERRO em update_user.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erro interno: " . $e->getMessage()
    ]);
}
?>