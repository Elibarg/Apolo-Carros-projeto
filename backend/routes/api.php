<?php
class Router {
    private $db;
    private $authMiddleware;

    public function __construct($db) {
        $this->db = $db;
        $this->authMiddleware = new AuthMiddleware($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/backend/public', '', $path);

        // Headers para CORS
        if ($method == 'OPTIONS') {
            exit(0);
        }

        // Limpar sessões expiradas periodicamente
        $this->cleanupExpiredSessions();

        try {
            // Rotas públicas de autenticação
            switch ($path) {
                case '/api/register':
                    if ($method == 'POST') {
                        $data = json_decode(file_get_contents("php://input"), true);
                        $authController = new AuthController($this->db);
                        $authController->register($data);
                    }
                    break;

                case '/api/login':
                    if ($method == 'POST') {
                        $data = json_decode(file_get_contents("php://input"), true);
                        $authController = new AuthController($this->db);
                        $authController->login($data);
                    }
                    break;

                case '/api/logout':
                    if ($method == 'POST') {
                        $headers = getallheaders();
                        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
                        $authController = new AuthController($this->db);
                        $authController->logout($token);
                    }
                    break;

                case '/api/verify':
                    if ($method == 'GET') {
                        $headers = getallheaders();
                        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
                        $authController = new AuthController($this->db);
                        $authController->verify($token);
                    }
                    break;

                default:
                    // Rotas protegidas por autenticação
                    $this->handleProtectedRoutes($path, $method);
            }
        } catch (Exception $e) {
            error_log("Router error: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }

    private function handleProtectedRoutes($path, $method) {
        switch ($path) {
            // Rotas de usuário (requer autenticação)
            case '/api/profile':
                $user_data = $this->authMiddleware->authenticate();
                $userController = new UserController($this->db);

                if ($method == 'GET') {
                    $userController->getProfile($user_data['user_id']);
                } elseif ($method == 'PUT') {
                    $data = json_decode(file_get_contents("php://input"), true);
                    $userController->updateProfile($user_data['user_id'], $data);
                }
                break;

            // Rotas administrativas - Gerenciamento de usuários
            case '/api/admin/users/create':
                $user_data = $this->authMiddleware->requireAdmin();
                $userController = new UserController($this->db);
                
                if ($method == 'POST') {
                    $data = json_decode(file_get_contents("php://input"), true);
                    $userController->createUserAsAdmin($data);
                }
                break;

            case '/api/admin/users':
                $user_data = $this->authMiddleware->requireAdmin();
                $userController = new UserController($this->db);

                if ($method == 'GET') {
                    $filters = [
                        'status' => $_GET['status'] ?? '',
                        'tipo' => $_GET['tipo'] ?? '',
                        'search' => $_GET['search'] ?? ''
                    ];
                    $userController->getAllUsers($filters);
                }
                break;

            case '/api/admin/users/stats':
                $user_data = $this->authMiddleware->requireAdmin();
                $userController = new UserController($this->db);

                if ($method == 'GET') {
                    $this->getUserStats();
                }
                break;

            // Rotas específicas por ID de usuário
            default:
                $this->handleUserByIdRoutes($path, $method);
        }
    }

    private function handleUserByIdRoutes($path, $method) {
        // Padrão: /api/admin/users/{id}
        if (preg_match('/\/api\/admin\/users\/(\d+)$/', $path, $matches)) {
            $user_data = $this->authMiddleware->requireAdmin();
            $userController = new UserController($this->db);
            $user_id = $matches[1];

            if ($method == 'GET') {
                $userController->getUserById($user_id);
            } elseif ($method == 'PUT') {
                $data = json_decode(file_get_contents("php://input"), true);
                if (isset($data['status'])) {
                    $userController->updateStatus($user_id, $data['status']);
                } else {
                    Response::error('Status não fornecido');
                }
            } elseif ($method == 'DELETE') {
                $userController->deleteUser($user_id);
            }
            return;
        }

        // Padrão: /api/admin/users/{id}/type
        if (preg_match('/\/api\/admin\/users\/(\d+)\/type$/', $path, $matches)) {
            $user_data = $this->authMiddleware->requireAdmin();
            $userController = new UserController($this->db);
            $user_id = $matches[1];

            if ($method == 'PUT') {
                $data = json_decode(file_get_contents("php://input"), true);
                if (isset($data['tipo'])) {
                    $userController->updateType($user_id, $data['tipo']);
                } else {
                    Response::error('Tipo não fornecido');
                }
            }
            return;
        }

        // Padrão: /api/admin/users/{id}/password
        if (preg_match('/\/api\/admin\/users\/(\d+)\/password$/', $path, $matches)) {
            $user_data = $this->authMiddleware->requireAdmin();
            $userController = new UserController($this->db);
            $user_id = $matches[1];

            if ($method == 'PUT') {
                $data = json_decode(file_get_contents("php://input"), true);
                if (isset($data['nova_senha'])) {
                    $userController->resetPassword($user_id, $data['nova_senha']);
                } else {
                    Response::error('Nova senha não fornecida');
                }
            }
            return;
        }

        // Rota não encontrada
        Response::notFound('Rota não encontrada');
    }

    // Estatísticas de usuários para dashboard
    private function getUserStats() {
        try {
            $query = "SELECT 
                COUNT(*) as total_usuarios,
                SUM(CASE WHEN tipo = 'admin' THEN 1 ELSE 0 END) as total_admins,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as usuarios_ativos,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as usuarios_inativos,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as novos_hoje,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as novos_7_dias
            FROM users";

            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            Response::success(['stats' => $stats]);
        } catch (Exception $e) {
            Response::error('Erro ao buscar estatísticas: ' . $e->getMessage());
        }
    }

    // Limpar sessões expiradas
    private function cleanupExpiredSessions() {
        try {
            if (rand(1, 10) === 1) {
                $auth = new Auth($this->db);
                $auth->cleanupExpiredSessions();
            }
        } catch (Exception $e) {
            error_log("Cleanup error: " . $e->getMessage());
        }
    }
}

// Inicializar e executar router
$database = new Database();
$db = $database->getConnection();

$router = new Router($db);
$router->handleRequest();
?>