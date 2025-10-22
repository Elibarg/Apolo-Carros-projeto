<?php
// Arquivo: backend/api/verify_password.php (VERSÃO CORRIGIDA)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
        echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Não foi possível conectar ao banco de dados");
    }

    // ✅ OBTER DADOS DA REQUISIÇÃO
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    error_log("🔐 Verify Password - Dados recebidos: " . print_r($data, true));

    if(!$data || empty($data->senha_atual)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Senha atual não fornecida."]);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $senha_digitada = $data->senha_atual;

    // ✅ MÉTODO DIRETO - EVITANDO A CLASSE User
    $query = "SELECT senha FROM usuarios WHERE id = :id AND ativo = 1 LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $user_id);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $hash_do_banco = $row['senha'];
        
        error_log("🔐 Verify Password - Hash do banco: " . $hash_do_banco);
        error_log("🔐 Verify Password - Senha digitada: " . $senha_digitada);
        
        // ✅ VERIFICAR SENHA
        if (password_verify($senha_digitada, $hash_do_banco)) {
            error_log("✅ Verify Password - SENHA VÁLIDA para usuário: " . $user_id);
            echo json_encode([
                "success" => true, 
                "message" => "Senha válida.",
                "debug" => [
                    "user_id" => $user_id,
                    "hash_prefix" => substr($hash_do_banco, 0, 20) . "..."
                ]
            ]);
        } else {
            error_log("❌ Verify Password - SENHA INVÁLIDA para usuário: " . $user_id);
            echo json_encode([
                "success" => false, 
                "message" => "Senha atual incorreta.",
                "debug" => [
                    "user_id" => $user_id,
                    "hash_prefix" => substr($hash_do_banco, 0, 20) + "..."
                ]
            ]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
    }

} catch (Exception $e) {
    error_log("💥 ERRO em verify_password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro interno do servidor."]);
}
?>