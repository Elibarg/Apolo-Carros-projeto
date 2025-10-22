<?php
// Arquivo: backend/api/login.php (VERSÃO CORRIGIDA)
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

if(!empty($data->email) && !empty($data->senha)) {
    $user->email = $data->email;
    $email_exists = $user->emailExists();
    
    if($email_exists && password_verify($data->senha, $user->senha)) {
        // Gerar token
        $token = bin2hex(random_bytes(32));
        
        // Iniciar sessão
        session_start();
        $_SESSION['user_id'] = $user->id;
        $_SESSION['user_name'] = $user->nome_completo; // CORRIGIDO: nome_completo
        $_SESSION['user_email'] = $user->email;
        $_SESSION['user_type'] = $user->tipo_usuario;
        $_SESSION['logged_in'] = true;
        
        // Detecção automática do caminho base
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $base_path = '/Apolo-Carros-projeto';
        
        // Redirecionamento
        $redirectTo = $user->tipo_usuario === 'admin' 
            ? "{$protocol}://{$host}{$base_path}/html/adm/painel_de_vendas.html" 
            : "{$protocol}://{$host}{$base_path}/html/index.html";
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login realizado com sucesso.",
            "data" => array(
                "token" => $token,
                "user" => array(
                    "id" => $user->id,
                    "nome_completo" => $user->nome_completo, // CORRIGIDO: nome_completo
                    "email" => $user->email,
                    "tipo_usuario" => $user->tipo_usuario
                ),
                "redirectTo" => $redirectTo
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Email ou senha incorretos."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Dados incompletos."));
}
?>