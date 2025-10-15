<?php
// Arquivo: backend/api/debug_login_full.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

// Testar login completo
$user->email = 'admin@apolocarros.com';
$email_exists = $user->emailExists();
$password_correct = $email_exists && password_verify('password', $user->senha);

if ($password_correct) {
    // Calcular redirecionamento
    $redirectTo = $user->tipo_usuario === 'admin' 
        ? '../../html/adm/painel_de_vendas.html' 
        : '../../html/usuario/usuario.html';
    
    echo json_encode([
        "success" => true,
        "message" => "Login funcionando!",
        "redirect_calculated" => $redirectTo,
        "user_type" => $user->tipo_usuario,
        "absolute_path" => realpath($redirectTo),
        "file_exists" => file_exists($redirectTo)
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Credenciais incorretas"
    ]);
}
?>