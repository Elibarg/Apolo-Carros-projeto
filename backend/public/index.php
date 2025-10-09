<?php
// Incluir configurações
require_once '../config/env.php';
require_once '../config/database.php';
require_once '../models/User.php';
require_once '../models/Auth.php';
require_once '../utils/Response.php';
require_once '../utils/Validation.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../controllers/AuthController.php';
require_once '../controllers/UserController.php';
require_once '../routes/api.php';

// Inicializar banco de dados
$database = new Database();
$db = $database->getConnection();

// Inicializar e executar router
$router = new Router($db);
$router->handleRequest();
?>