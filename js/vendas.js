// js/vendas.js
class SalesDashboard {
    constructor() {
        this.API_URL = "../../backend/api/sales.php";
        this.VEHICLES_API_URL = "../../backend/api/vehicles.php";
        this.init();
    }

    async init() {
        if (await this.checkAdminAccess()) {
            this.setupEventListeners();
            this.setupTabs();
            await this.loadSalesData();
        }
    }

    async checkAdminAccess() {
        // Verificar se AuthService existe
        if (typeof AuthService === 'undefined') {
            console.error('AuthService não encontrado. Verifique se auth-integration.js está carregado.');
            alert('Erro de autenticação. Redirecionando para login...');
            window.location.href = '../../html/login.html';
            return false;
        }

        const userData = AuthService.getUserData();
        
        if (userData && userData.tipo_usuario === 'admin') {
            console.log('✅ Admin autenticado:', userData);
            return true;
        } else {
            console.log('❌ Acesso negado. Redirecionando...');
            alert('Acesso restrito a administradores.');
            window.location.href = '../../html/login.html';
            return false;
        }
    }

    async loadSalesData() {
        try {
            this.showLoading();
            
            console.log('📊 Carregando dados de vendas...');
            const response = await fetch(this.API_URL);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                console.log('✅ Dados de vendas carregados com sucesso:', data.data);
                this.updateDashboard(data.data);
                await this.loadInventoryData();
            } else {
                throw new Error(data.message || 'Erro ao carregar dados');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados de vendas:', error);
            this.showError('Erro ao carregar dados de vendas: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadInventoryData() {
        try {
            console.log('🚗 Carregando dados do estoque...');
            
            // ✅ CORREÇÃO: Buscar apenas veículos com status 'available'
            const response = await fetch(`${this.VEHICLES_API_URL}?status=available&limit=8`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                console.log('✅ Estoque carregado com sucesso:', data.data.vehicles.length + ' veículos disponíveis');
                
                // ✅ CORREÇÃO: Filtrar novamente no frontend para garantir
                const availableVehicles = data.data.vehicles.filter(vehicle => 
                    vehicle.status === 'available'
                );
                
                this.updateInventory(availableVehicles);
            } else {
                console.warn('⚠️ Erro ao carregar estoque:', data.message);
                this.updateInventory([]); // Mostrar estoque vazio em caso de erro
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estoque:', error);
            this.updateInventory([]); // Mostrar estoque vazio em caso de erro
        }
    }

    updateDashboard(salesData) {
        // Atualizar estatísticas
        this.updateStats(salesData);
        
        // Atualizar gráfico de vendas mensais
        this.updateMonthlyChart(salesData.vendas_mensais);
        
        // Atualizar vendas recentes
        this.updateRecentSales(salesData.vendas_recentes);
    }

    updateStats(salesData) {
        console.log('📈 Atualizando estatísticas...');
        
        // Veículos vendidos
        const totalVendidosEl = document.getElementById('totalVendidos');
        if (totalVendidosEl) {
            totalVendidosEl.textContent = salesData.total_vendidos.toLocaleString();
            console.log(`📊 Total vendidos: ${salesData.total_vendidos}`);
        }
        
        // Faturamento total
        const faturamentoTotalEl = document.getElementById('faturamentoTotal');
        if (faturamentoTotalEl) {
            faturamentoTotalEl.textContent = this.formatCurrency(salesData.faturamento_total);
            console.log(`💰 Faturamento total: ${this.formatCurrency(salesData.faturamento_total)}`);
        }
        
        // Vendas do mês atual
        const currentMonth = new Date().getMonth();
        const currentMonthSales = salesData.vendas_mensais.find(m => {
            const monthIndex = this.getMonthIndex(m.mes);
            return monthIndex === currentMonth;
        });
        const vendasMes = currentMonthSales ? currentMonthSales.vendas : 0;
        
        const vendasMesEl = document.getElementById('vendasMes');
        if (vendasMesEl) {
            vendasMesEl.textContent = vendasMes.toLocaleString();
            console.log(`📅 Vendas do mês: ${vendasMes}`);
        }
        
        const mesAtualEl = document.getElementById('mesAtual');
        if (mesAtualEl) {
            mesAtualEl.textContent = this.getMonthName(currentMonth);
        }
        
        // Ticket médio
        const ticketMedio = salesData.total_vendidos > 0 ? salesData.faturamento_total / salesData.total_vendidos : 0;
        const ticketMedioEl = document.getElementById('ticketMedio');
        if (ticketMedioEl) {
            ticketMedioEl.textContent = this.formatCurrency(ticketMedio);
            console.log(`🎫 Ticket médio: ${this.formatCurrency(ticketMedio)}`);
        }
    }

    updateMonthlyChart(monthlySales) {
        console.log('📊 Atualizando gráfico mensal...');
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) {
            console.warn('⚠️ Container do gráfico não encontrado');
            return;
        }

        // Limpar container
        chartContainer.innerHTML = '';

        if (!monthlySales || monthlySales.length === 0) {
            chartContainer.innerHTML = `
                <div class="chart-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <p>Nenhum dado disponível para o gráfico</p>
                </div>
            `;
            return;
        }

        // Encontrar o máximo de vendas para escala
        const maxSales = Math.max(...monthlySales.map(item => item.vendas), 1);

        // Criar barras do gráfico
        monthlySales.forEach(monthData => {
            const height = Math.max((monthData.vendas / maxSales) * 100, 10); // Mínimo 10% de altura
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${height}%`;
            bar.setAttribute('data-month', monthData.mes);
            bar.setAttribute('data-vendas', monthData.vendas);
            bar.setAttribute('data-faturamento', this.formatCurrency(monthData.faturamento));
            
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.innerHTML = `
                <strong>${monthData.mes}</strong><br>
                Vendas: ${monthData.vendas}<br>
                Faturamento: ${this.formatCurrency(monthData.faturamento)}
            `;
            tooltip.style.pointerEvents = 'none';
            bar.appendChild(tooltip);

            chartContainer.appendChild(bar);
        });

        console.log(`📈 Gráfico atualizado com ${monthlySales.length} meses`);
        
        // Adicionar event listeners para tooltips
        this.setupChartTooltips();
    }

    updateRecentSales(recentSales) {
        console.log('🔄 Atualizando vendas recentes...');
        const tableBody = document.getElementById('recentSalesTable');
        if (!tableBody) {
            console.warn('⚠️ Tabela de vendas recentes não encontrada');
            return;
        }

        if (!recentSales || recentSales.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #7f8c8d; padding: 2rem;">
                        <i class="fas fa-info-circle"></i> Nenhuma venda recente encontrada
                    </td>
                </tr>
            `;
            console.log('📝 Nenhuma venda recente para exibir');
            return;
        }

        tableBody.innerHTML = recentSales.map((sale, index) => `
            <tr>
                <td>
                    <strong>${sale.marca} ${sale.modelo}</strong><br>
                    <small style="color: #7f8c8d;">${sale.ano} • ${sale.km ? sale.km.toLocaleString() + ' km' : 'N/A'}</small>
                </td>
                <td>${this.formatDate(sale.data_compra)}</td>
                <td><strong style="color: #27ae60;">${this.formatCurrency(sale.preco)}</strong></td>
                <td>
                    <span class="status sold">
                        <i class="fas fa-check-circle"></i> Vendido
                    </span>
                </td>
            </tr>
        `).join('');

        console.log(`📋 ${recentSales.length} vendas recentes carregadas`);
    }

    updateInventory(vehicles) {
        console.log('🏭 Atualizando grid de estoque...');
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) {
            console.warn('⚠️ Grid de inventário não encontrado');
            return;
        }

        // ✅ CORREÇÃO: Filtrar veículos disponíveis novamente (double check)
        const availableVehicles = vehicles.filter(vehicle => 
            vehicle.status === 'available'
        );

        console.log(`📊 Veículos filtrados: ${availableVehicles.length} disponíveis de ${vehicles.length} totais`);

        if (!availableVehicles || availableVehicles.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="inventory-item" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-car" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                    <h3 style="color: #7f8c8d; margin-bottom: 0.5rem;">Estoque Vazio</h3>
                    <p style="color: #95a5a6;">Todos os veículos foram vendidos ou estão reservados</p>
                    <button class="btn btn-primary" onclick="window.location.href='adicionar_estoque.html'" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Adicionar Veículo
                    </button>
                </div>
            `;
            console.log('🚫 Nenhum veículo disponível no estoque');
            return;
        }

        inventoryGrid.innerHTML = availableVehicles.map(vehicle => {
            // ✅ CORREÇÃO: Verificar status novamente antes de renderizar
            if (vehicle.status !== 'available') {
                console.warn(`⚠️ Veículo ${vehicle.id} não está disponível: ${vehicle.status}`);
                return '';
            }
            
            return `
                <div class="inventory-item">
                    <h3>${vehicle.marca} ${vehicle.modelo}</h3>
                    <p><strong>Ano:</strong> ${vehicle.ano}</p>
                    <p><strong>KM:</strong> ${vehicle.km ? vehicle.km.toLocaleString() + ' km' : '0 km'}</p>
                    <p><strong>Preço:</strong> ${this.formatCurrency(vehicle.preco)}</p>
                    <span class="status available">
                        <i class="fas fa-check"></i> Disponível
                    </span>
                    <div class="inventory-actions">
                        <button class="btn btn-primary btn-sm" onclick="salesDashboard.viewVehicleDetails(${vehicle.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="salesDashboard.previewVehicle(${vehicle.id})">
                            <i class="fas fa-eye"></i> Visualizar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        console.log(`🚗 ${availableVehicles.length} veículos disponíveis carregados no estoque`);
    }

    setupChartTooltips() {
        const bars = document.querySelectorAll('.chart-bar');
        
        bars.forEach(bar => {
            bar.addEventListener('mouseenter', function(e) {
                const tooltip = this.querySelector('.chart-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                }
            });
            
            bar.addEventListener('mouseleave', function(e) {
                const tooltip = this.querySelector('.chart-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });

            bar.addEventListener('click', function(e) {
                const month = this.getAttribute('data-month');
                const vendas = this.getAttribute('data-vendas');
                const faturamento = this.getAttribute('data-faturamento');
                console.log(`📊 Clique no mês ${month}: ${vendas} vendas, ${faturamento}`);
            });
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        if (tabBtns.length === 0) {
            console.warn('⚠️ Abas não encontradas no DOM');
            return;
        }

        console.log(`📑 ${tabBtns.length} abas configuradas`);

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover classe active de todos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Adicionar classe active ao botão clicado
                btn.classList.add('active');

                // Mostrar conteúdo correspondente
                const tabId = btn.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    console.log(`🔍 Alternando para aba: ${tabId}`);
                    
                    // Carregar dados específicos da aba se necessário
                    if (tabId === 'estoque') {
                        this.loadInventoryData();
                    }
                }
            });
        });
    }

    setupEventListeners() {
        // Botão de atualizar dados
        const refreshBtn = document.getElementById('refreshSales');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Atualizando dados manualmente...');
                this.loadSalesData();
            });
            console.log('✅ Botão de atualizar configurado');
        } else {
            console.warn('⚠️ Botão refreshSales não encontrado');
        }

        // Botão de exportar dados (se existir)
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Filtro de período (se existir)
        const periodFilter = document.getElementById('periodFilter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => this.filterByPeriod(e.target.value));
        }
    }

    // Métodos de navegação
    viewVehicleDetails(vehicleId) {
        console.log(`🔍 Navegando para detalhes do veículo: ${vehicleId}`);
        window.location.href = `editar_estoque.html?id=${vehicleId}`;
    }

    previewVehicle(vehicleId) {
        console.log(`👀 Visualizando veículo: ${vehicleId}`);
        // Aqui você pode implementar um modal de preview
        alert(`Visualizando veículo ID: ${vehicleId}\n\nEsta funcionalidade pode ser expandida para mostrar um modal com detalhes completos.`);
    }

    // Métodos utilitários
    formatCurrency(value) {
        if (value === null || value === undefined) {
            return 'R$ 0,00';
        }
        
        const numberValue = typeof value === 'string' ? parseFloat(value) : value;
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numberValue);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Data inválida';
            }
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            console.error('Erro ao formatar data:', e);
            return 'Data inválida';
        }
    }

    getMonthIndex(monthAbbr) {
        const months = {
            'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
            'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
        };
        return months[monthAbbr] ?? 0;
    }

    getMonthName(monthIndex) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[monthIndex] || 'Mês atual';
    }

    // Métodos de UI
    showLoading() {
        const refreshBtn = document.getElementById('refreshSales');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            refreshBtn.disabled = true;
        }

        // Mostrar loading global se necessário
        this.showGlobalLoading();
    }

    hideLoading() {
        const refreshBtn = document.getElementById('refreshSales');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Dados';
            refreshBtn.disabled = false;
        }

        // Esconder loading global se necessário
        this.hideGlobalLoading();
    }

    showGlobalLoading() {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            loader.innerHTML = `
                <div style="text-align: center; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
                    <p style="margin: 0; color: #2c3e50; font-weight: 600;">Carregando dados...</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }

    hideGlobalLoading() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showError(message) {
        console.error('❌ Erro no painel:', message);
        
        // Criar toast de erro
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        console.log('✅ Sucesso:', message);
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db';
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remover após 5 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    // Método de debug para verificar status dos veículos
    async debugVehicleStatus() {
        try {
            console.log('🐛 Debug: Verificando status de todos os veículos...');
            const response = await fetch(this.VEHICLES_API_URL);
            const data = await response.json();
            
            if (data.success) {
                console.log('=== DEBUG VEÍCULOS ===');
                data.data.vehicles.forEach(vehicle => {
                    console.log(`🚗 ${vehicle.marca} ${vehicle.modelo} - Status: ${vehicle.status} - Preço: ${this.formatCurrency(vehicle.preco)}`);
                });
                console.log('======================');
            }
        } catch (error) {
            console.error('Erro no debug:', error);
        }
    }

    // Métodos adicionais (para futuras expansões)
    exportData() {
        console.log('📤 Exportando dados...');
        this.showToast('Funcionalidade de exportação em desenvolvimento', 'info');
    }

    filterByPeriod(period) {
        console.log(`🔍 Filtrando por período: ${period}`);
        // Implementar lógica de filtro aqui
    }

    // Destruir instância (para limpeza)
    destroy() {
        console.log('🧹 Limpando instância do SalesDashboard');
        // Remover event listeners se necessário
    }
}

// Adicionar estilos CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Variável global para acesso externo
let salesDashboard;

// Inicializar dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando SalesDashboard...');
    salesDashboard = new SalesDashboard();
    
    // Para debug temporário, descomente a linha abaixo:
    // setTimeout(() => salesDashboard.debugVehicleStatus(), 2000);
});

// Exportar para uso em outros módulos (se usando ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesDashboard;
}