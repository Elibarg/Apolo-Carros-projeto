<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(0);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once '../config/database.php';

try {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Não autenticado"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $user_id = $_SESSION['user_id'];
    $senha_testada = $_GET['senha'] ?? 'password';

    // ✅ BUSCAR HASH DIRETAMENTE DO BANCO
    $query = "SELECT senha FROM usuarios WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $user_id);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if($row) {
        $hash_do_banco = $row['senha'];
        
        // ✅ TESTAR A SENHA DIRETAMENTE
        $senha_correta = password_verify($senha_testada, $hash_do_banco);
        
        echo json_encode([
            "success" => true,
            "data" => [
                "senha_testada" => $senha_testada,
                "hash_do_banco" => $hash_do_banco,
                "senha_correta" => $senha_correta,
                "user_id" => $user_id
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Usuário não encontrado"]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>