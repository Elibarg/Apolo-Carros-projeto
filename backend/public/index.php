<?php
// backend/public/index.php

// Configurações de CORS PRIMEIRO
header("Access-Control-Allow-Origin: http://localhost");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Debug (desative em produção)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inicializar resposta
$response = [];

try {
    if (isset($_GET['route'])) {
        switch($_GET['route']) {
            case '/api/vehicles':
                $response = [
                    'success' => true,
                    'data' => [
                        'vehicles' => [
                            [
                                'id' => 1,
                                'brand' => 'Chevrolet',
                                'model' => 'Onix',
                                'year' => 2021,
                                'price' => 95000,
                                'km' => 45000,
                                'color' => 'Vermelho',
                                'city' => 'São Paulo',
                                'state' => 'SP',
                                'main_image' => '../img/Chevrolet_Onix.png'
                            ],
                            [
                                'id' => 2,
                                'brand' => 'Volkswagen',
                                'model' => 'Golf',
                                'year' => 2020,
                                'price' => 120000,
                                'km' => 30000,
                                'color' => 'Preto',
                                'city' => 'São Paulo',
                                'state' => 'SP',
                                'main_image' => '../img/Chevrolet_Onix.png'
                            ]
                        ]
                    ]
                ];
                break;
                
            case '/api/login':
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    // Ler o JSON do corpo da requisição
                    $input = json_decode(file_get_contents('php://input'), true);
                    $email = $input['email'] ?? '';
                    $senha = $input['senha'] ?? '';
                    
                    if ($email === 'admin@apolocarros.com.br' && $senha === 'password') {
                        $response = [
                            'success' => true,
                            'message' => 'Login realizado com sucesso',
                            'data' => [
                                'token' => 'fake_token_' . time(),
                                'user' => [
                                    'id' => 1,
                                    'nome_completo' => 'Administrador',
                                    'email' => 'admin@apolocarros.com.br',
                                    'tipo' => 'admin',
                                    'isAdmin' => true
                                ],
                                'redirectTo' => '/Apolo-Carros-projeto/html/adm/painel_de_vendas.html'
                            ]
                        ];
                    } else {
                        $response = [
                            'success' => false,
                            'message' => 'Email ou senha incorretos'
                        ];
                    }
                } else {
                    $response = [
                        'success' => false,
                        'message' => 'Método não permitido'
                    ];
                }
                break;
                
            case '/api/register':
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $response = [
                        'success' => true,
                        'message' => 'Usuário criado com sucesso',
                        'data' => [
                            'user' => [
                                'id' => 2,
                                'nome_completo' => $input['nome_completo'] ?? 'Usuário',
                                'email' => $input['email'] ?? '',
                                'tipo' => 'user'
                            ]
                        ]
                    ];
                }
                break;
                
            case '/api/verify':
                $headers = getallheaders();
                $authHeader = $headers['Authorization'] ?? '';
                $token = str_replace('Bearer ', '', $authHeader);
                
                if ($token && strpos($token, 'fake_token_') === 0) {
                    $response = [
                        'success' => true,
                        'valid' => true,
                        'user' => [
                            'id' => 1,
                            'nome_completo' => 'Administrador',
                            'email' => 'admin@apolocarros.com.br',
                            'tipo' => 'admin'
                        ]
                    ];
                } else {
                    $response = [
                        'success' => true,
                        'valid' => false
                    ];
                }
                break;
                
            default:
                $response = [
                    'success' => false,
                    'message' => 'Rota não encontrada: ' . $_GET['route']
                ];
                http_response_code(404);
        }
    } else {
        $response = [
            'success' => true,
            'message' => 'Backend Apolo Carros API',
            'version' => '1.0',
            'endpoints' => [
                'POST /api/login',
                'POST /api/register', 
                'GET /api/vehicles',
                'GET /api/verify'
            ]
        ];
    }
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Erro interno: ' . $e->getMessage()
    ];
    http_response_code(500);
}

// Enviar resposta como JSON
echo json_encode($response, JSON_PRETTY_PRINT);
?>