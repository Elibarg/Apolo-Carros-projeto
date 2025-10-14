<?php
class AdminDashboard {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Obter estatísticas do dashboard
    public function getStats() {
        try {
            // Estatísticas de usuários
            $userStats = $this->getUserStats();
            
            // Estatísticas de veículos
            $vehicleStats = $this->getVehicleStats();
            
            // Estatísticas de contatos
            $contactStats = $this->getContactStats();
            
            // Vendas recentes (simulação)
            $recentSales = $this->getRecentSales();

            Response::success([
                'user_stats' => $userStats,
                'vehicle_stats' => $vehicleStats,
                'contact_stats' => $contactStats,
                'recent_sales' => $recentSales
            ]);

        } catch (Exception $e) {
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage());
        }
    }

    private function getUserStats() {
        $query = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN tipo = 'admin' THEN 1 ELSE 0 END) as admins,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_week
        FROM users";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getVehicleStats() {
        $query = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_week
        FROM vehicles";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getContactStats() {
        $query = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'answered' THEN 1 ELSE 0 END) as answered,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
        FROM contacts";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getRecentSales() {
        // Simulação de vendas recentes
        // Em um sistema real, isso viria de uma tabela de vendas
        return [
            [
                'id' => 1,
                'vehicle' => 'Chevrolet Onix 2021',
                'customer' => 'João Silva',
                'amount' => 95000.00,
                'date' => date('Y-m-d H:i:s', strtotime('-1 day'))
            ],
            [
                'id' => 2,
                'vehicle' => 'Volkswagen Golf 2020',
                'customer' => 'Maria Santos',
                'amount' => 120000.00,
                'date' => date('Y-m-d H:i:s', strtotime('-2 days'))
            ],
            [
                'id' => 3,
                'vehicle' => 'Fiat Mobi 2022',
                'customer' => 'Pedro Oliveira',
                'amount' => 55000.00,
                'date' => date('Y-m-d H:i:s', strtotime('-3 days'))
            ]
        ];
    }

    // Obter gráfico de vendas mensais
    public function getMonthlySales() {
        $query = "SELECT 
            YEAR(created_at) as year,
            MONTH(created_at) as month,
            COUNT(*) as count,
            SUM(price) as revenue
        FROM vehicles 
        WHERE status = 'sold' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at)
        ORDER BY year DESC, month DESC
        LIMIT 12";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success(['monthly_sales' => $sales]);
    }
}
?>