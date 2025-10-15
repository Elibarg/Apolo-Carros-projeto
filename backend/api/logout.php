<?php
// Arquivo: backend/api/logout.php (VERSÃO PARA REDIRECIONAR AO INDEX)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// ✅ INICIAR SESSÃO SE NÃO ESTIVER INICIADA
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ✅ VERIFICAR SE HÁ USUÁRIO LOGADO
$wasLoggedIn = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;

if ($wasLoggedIn) {
    // ✅ LIMPAR TODOS OS DADOS DA SESSÃO
    $_SESSION = array();
    
    // ✅ DESTRUIR COOKIE DE SESSÃO
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // ✅ DESTRUIR SESSÃO
    session_destroy();
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true, 
        "message" => "Logout realizado com sucesso.",
        "redirect" => "../../html/index.html"  // ✅ MUDEI PARA INDEX
    ));
} else {
    http_response_code(200); // ✅ Mudei para 200 mesmo sem estar logado
    echo json_encode(array(
        "success" => true, 
        "message" => "Nenhum usuário estava logado.",
        "redirect" => "../../html/index.html"  // ✅ MUDEI PARA INDEX
    ));
}
?>