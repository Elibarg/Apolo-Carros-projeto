<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

ini_set('display_errors', 0);
error_reporting(0);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once '../config/database.php';
include_once '../models/User.php';

try {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Não autenticado"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $user->id = $_SESSION['user_id'];

    // Buscar dados incluindo a senha (apenas para debug)
    $query = "SELECT senha as senha_hash FROM usuarios WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $user->id);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if($row) {
        echo json_encode([
            "success" => true,
            "data" => [
                "senha_hash" => $row['senha_hash']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Usuário não encontrado"]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>