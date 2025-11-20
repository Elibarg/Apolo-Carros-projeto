<?php
// backend/api/sales.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

// Definir fuso horário para Brasil
date_default_timezone_set('America/Sao_Paulo');

if (session_status() === PHP_SESSION_NONE) session_start();

$database = new Database();
$db = $database->getConnection();

try {
    // proteger rotas de administração
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || ($_SESSION['user_type'] ?? '') !== 'admin') {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Não autorizado."]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Estatísticas de vendas
        $current_year = date('Y');
        
        // Total de veículos vendidos
        $query = "SELECT COUNT(*) as total_vendidos FROM veiculos WHERE status = 'sold' AND ativo = 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $total_vendidos = $stmt->fetch(PDO::FETCH_ASSOC)['total_vendidos'];

        // Faturamento total
        $query = "SELECT SUM(preco) as faturamento_total FROM veiculos WHERE status = 'sold' AND ativo = 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $faturamento_total = $stmt->fetch(PDO::FETCH_ASSOC)['faturamento_total'] ?? 0;

        // Vendas por mês (últimos 6 meses)
        $vendas_mensais = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = date('n') - $i;
            $year = date('Y');
            
            if ($month <= 0) {
                $month += 12;
                $year -= 1;
            }
            
            $start_date = date("$year-$month-01");
            $end_date = date("$year-$month-t", strtotime($start_date));
            
            $query = "SELECT COUNT(*) as vendas, SUM(preco) as faturamento 
                      FROM veiculos 
                      WHERE status = 'sold' 
                      AND data_compra BETWEEN :start_date AND :end_date 
                      AND ativo = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":start_date", $start_date);
            $stmt->bindParam(":end_date", $end_date);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $vendas_mensais[] = [
                'mes' => date('M', strtotime($start_date)),
                'vendas' => (int)$result['vendas'],
                'faturamento' => (float)($result['faturamento'] ?? 0),
                'mes_completo' => date('m/Y', strtotime($start_date))
            ];
        }

        // Veículos vendidos recentemente (últimos 10)
        $query = "SELECT marca, modelo, ano, preco, data_compra 
                  FROM veiculos 
                  WHERE status = 'sold' AND ativo = 1 
                  ORDER BY data_compra DESC 
                  LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $vendas_recentes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => [
                "total_vendidos" => (int)$total_vendidos,
                "faturamento_total" => (float)$faturamento_total,
                "vendas_mensais" => $vendas_mensais,
                "vendas_recentes" => $vendas_recentes
            ]
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método não permitido."]);
    }
} catch (Exception $e) {
    error_log("Erro sales.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro interno"]);
}
?>