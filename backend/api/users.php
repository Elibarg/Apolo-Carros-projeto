
<?php
// Arquivo: backend/api/users.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/User.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Verificar autenticação e privilégios de admin
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Não autorizado."]);
        exit;
    }

    if ($_SESSION['user_type'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Acesso restrito a administradores."]);
        exit;
    }

    switch ($method) {
        case 'GET':
            // Listar usuários ou buscar usuário específico
            if (isset($_GET['id'])) {
                // Buscar usuário específico
                $user->id = $_GET['id'];
                if ($user->readOne()) {
                    echo json_encode([
                        "success" => true,
                        "data" => [
                            "id" => $user->id,
                            "nome_completo" => $user->nome_completo,
                            "email" => $user->email,
                            "tipo_usuario" => $user->tipo_usuario,
                            "telefone" => $user->telefone,
                            "cpf" => $user->cpf,
                            "data_nascimento" => $user->data_nascimento,
                            "genero" => $user->genero,
                            "cep" => $user->cep,
                            "endereco" => $user->endereco,
                            "cidade" => $user->cidade,
                            "estado" => $user->estado,
                            "data_cadastro" => $user->data_cadastro
                        ]
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
                }
            } else {
                // Listar todos os usuários
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = ($page - 1) * $limit;

                $stmt = $user->readAll($offset, $limit);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $total_users = $user->countAll();

                echo json_encode([
                    "success" => true,
                    "data" => [
                        "users" => $users,
                        "pagination" => [
                            "current_page" => $page,
                            "per_page" => $limit,
                            "total_users" => $total_users,
                            "total_pages" => ceil($total_users / $limit)
                        ]
                    ]
                ]);
            }
            break;

        case 'POST':
            // Criar novo usuário
            $input = json_decode(file_get_contents("php://input"), true);

            if (!empty($input['nome_completo']) && !empty($input['email']) && !empty($input['senha'])) {
                $user->nome_completo = $input['nome_completo'];
                $user->email = $input['email'];
                $user->senha = $input['senha'];
                $user->tipo_usuario = $input['tipo_usuario'] ?? 'usuario';
                $user->telefone = $input['telefone'] ?? null;
                $user->cpf = $input['cpf'] ?? null;
                $user->data_nascimento = $input['data_nascimento'] ?? null;
                $user->genero = $input['genero'] ?? null;
                $user->cep = $input['cep'] ?? null;
                $user->endereco = $input['endereco'] ?? null;
                $user->bairro = $input['bairro'] ?? null;
                $user->cidade = $input['cidade'] ?? null;
                $user->estado = $input['estado'] ?? null;

                // Verificar se email já existe
                if ($user->emailExists()) {
                    http_response_code(400);
                    echo json_encode(["success" => false, "message" => "Email já cadastrado."]);
                    break;
                }

                // Verificar se CPF já existe
                if (!empty($user->cpf) && $user->cpfExists()) {
                    http_response_code(400);
                    echo json_encode(["success" => false, "message" => "CPF já cadastrado."]);
                    break;
                }

                if ($user->create()) {
                    http_response_code(201);
                    echo json_encode([
                        "success" => true,
                        "message" => "Usuário criado com sucesso.",
                        "data" => ["id" => $user->id]
                    ]);
                } else {
                    throw new Exception("Erro ao criar usuário.");
                }
            } else {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Dados incompletos."]);
            }
            break;

        case 'PUT':
            // Atualizar usuário
            $input = json_decode(file_get_contents("php://input"), true);
            $user_id = $_GET['id'] ?? $input['id'] ?? null;

            if (!$user_id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID do usuário não especificado."]);
                break;
            }

            $user->id = $user_id;
            
            if ($user->readOne()) {
                // Atualizar apenas campos fornecidos
                if (isset($input['nome_completo'])) $user->nome_completo = $input['nome_completo'];
                if (isset($input['email'])) $user->email = $input['email'];
                if (isset($input['telefone'])) $user->telefone = $input['telefone'];
                if (isset($input['tipo_usuario'])) $user->tipo_usuario = $input['tipo_usuario'];
                if (isset($input['data_nascimento'])) $user->data_nascimento = $input['data_nascimento'];
                if (isset($input['genero'])) $user->genero = $input['genero'];
                if (isset($input['cep'])) $user->cep = $input['cep'];
                if (isset($input['endereco'])) $user->endereco = $input['endereco'];
                if (isset($input['bairro'])) $user->bairro = $input['bairro'];
                if (isset($input['cidade'])) $user->cidade = $input['cidade'];
                if (isset($input['estado'])) $user->estado = $input['estado'];

                // Verificar email duplicado
                if (isset($input['email'])) {
                    $checkUser = new User($db);
                    $checkUser->email = $input['email'];
                    if ($checkUser->emailExists() && $checkUser->id != $user->id) {
                        http_response_code(400);
                        echo json_encode(["success" => false, "message" => "Email já está em uso."]);
                        break;
                    }
                }

                if ($user->update()) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Usuário atualizado com sucesso."
                    ]);
                } else {
                    throw new Exception("Erro ao atualizar usuário.");
                }
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
            }
            break;

        case 'DELETE':
            // ✅ EXCLUSÃO FÍSICA CORRIGIDA
            $user_id = $_GET['id'] ?? null;

            if (!$user_id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID do usuário não especificado."]);
                break;
            }

            $user->id = $user_id;
            
            // ✅ VERIFICAR SE O USUÁRIO EXISTE
            if (!$user->readOne()) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
                break;
            }

            // ✅ IMPEDIR AUTO-EXCLUSÃO
            if ($user_id == $_SESSION['user_id']) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Você não pode excluir sua própria conta."]);
                break;
            }

            // ✅ EXECUTAR EXCLUSÃO FÍSICA
            if ($user->delete()) {
                echo json_encode([
                    "success" => true,
                    "message" => "Usuário excluído permanentemente."
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "success" => false, 
                    "message" => "Erro ao excluir usuário."
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método não permitido."]);
            break;
    }

} catch (Exception $e) {
    error_log("💥 ERRO em users.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro interno do servidor."]);
}
?>
