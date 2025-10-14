<?php
// Configurações do ambiente
define('JWT_SECRET', 'apolo_carros_secret_key_2024');
define('TOKEN_EXPIRY', 86400); // 24 horas

// Headers para CORS - MAIS PERMISSIVO para desenvolvimento
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Origin, Accept");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Debug mode
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>