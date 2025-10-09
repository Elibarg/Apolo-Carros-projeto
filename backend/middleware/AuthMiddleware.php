<?php
class AuthMiddleware {
    private $auth;

    public function __construct($db) {
        $this->auth = new Auth($db);
    }

    public function authenticate() {
        $headers = getallheaders();
        $token = null;

        // Buscar token no header Authorization
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            Response::unauthorized('Token de autenticação não fornecido');
        }

        $user_data = $this->auth->validateToken($token);
        if (!$user_data) {
            Response::unauthorized('Token inválido ou expirado');
        }

        return $user_data;
    }

    public function requireAdmin() {
        $user_data = $this->authenticate();
        if ($user_data['tipo'] !== 'admin') {
            Response::unauthorized('Acesso restrito a administradores');
        }
        return $user_data;
    }
}
?>