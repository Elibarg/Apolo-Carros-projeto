<?php
// Arquivo: backend/api/upload_avatar.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Desligar erros para evitar respostas inválidas
ini_set('display_errors', 0);
error_reporting(0);

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once '../config/database.php';
include_once '../models/User.php';

try {
    // Verificar se o usuário está logado
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Usuário não autenticado."]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Não foi possível conectar ao banco de dados");
    }

    $user = new User($db);
    $user->id = $_SESSION['user_id'];

    // Verificar se foi enviado um arquivo
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nenhum arquivo enviado ou erro no upload."]);
        exit;
    }

    $arquivo = $_FILES['avatar'];

    // Validar tipo de arquivo
    $tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($arquivo['type'], $tiposPermitidos)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP."]);
        exit;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if ($arquivo['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Arquivo muito grande. Tamanho máximo: 5MB."]);
        exit;
    }

    // Criar diretório de avatares se não existir
    $diretorioAvatares = '../../img/avatars/';
    if (!is_dir($diretorioAvatares)) {
        mkdir($diretorioAvatares, 0755, true);
    }

    // Gerar nome único para o arquivo
    $extensao = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
    $nomeArquivo = 'avatar_' . $user->id . '_' . time() . '.' . $extensao;
    $caminhoCompleto = $diretorioAvatares . $nomeArquivo;

    // Mover arquivo para o diretório
    if (!move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
        throw new Exception("Erro ao salvar o arquivo.");
    }

    // Caminho relativo para salvar no banco
    $caminhoRelativo = '/Apolo-Carros-projeto/img/avatars/' . $nomeArquivo;

    // Atualizar no banco de dados
    if ($user->updateAvatar($caminhoRelativo)) {
        // Atualizar a sessão com a nova URL do avatar
        $_SESSION['user_avatar'] = $caminhoRelativo;
        
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Avatar atualizado com sucesso.",
            "avatar_url" => $caminhoRelativo
        ]);
    } else {
        // Se falhar no banco, remove o arquivo
        unlink($caminhoCompleto);
        throw new Exception("Erro ao atualizar avatar no banco de dados.");
    }

} catch (Exception $e) {
    error_log("Erro em upload_avatar.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erro interno do servidor: " . $e->getMessage()
    ]);
}
// ✅ ATUALIZAR A SESSÃO COM A NOVA URL DO AVATAR
$_SESSION['user_avatar'] = $caminhoRelativo;

http_response_code(200);
echo json_encode([
    "success" => true, 
    "message" => "Avatar atualizado com sucesso.",
    "avatar_url" => $caminhoRelativo,
    "debug" => [
        "user_id" => $user->id,
        "file_path" => $caminhoCompleto,
        "web_path" => $caminhoRelativo
    ]
]);
?>