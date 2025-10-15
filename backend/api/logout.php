<?php
// Arquivo: api/logout.php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Destruir todas as variáveis de sessão
$_SESSION = array();

// Destruir a sessão
session_destroy();

echo json_encode(array("success" => true, "message" => "Logout realizado com sucesso."));
?>