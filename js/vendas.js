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
            
            const response = await fetch(this.API_URL);
            const data = await response.json();

            if (data.success) {
                this.updateDashboard(data.data);
                await this.loadInventoryData();
            } else {
                throw new Error(data.message || 'Erro ao carregar dados');
            }
        } catch (error) {
            console.error('Erro ao carregar dados de vendas:', error);
            this.showError('Erro ao carregar dados de vendas: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadInventoryData() {
        try {
            const response = await fetch(`${this.VEHICLES_API_URL}?status=available&limit=8`);
            const data = await response.json();

            if (data.success) {
                this.updateInventory(data.data.vehicles);
            }
        } catch (error) {
            console.error('Erro ao carregar estoque:', error);
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
        // Veículos vendidos
        const totalVendidosEl = document.getElementById('totalVendidos');
        if (totalVendidosEl) {
            totalVendidosEl.textContent = salesData.total_vendidos.toLocaleString();
        }
        
        // Faturamento total
        const faturamentoTotalEl = document.getElementById('faturamentoTotal');
        if (faturamentoTotalEl) {
            faturamentoTotalEl.textContent = this.formatCurrency(salesData.faturamento_total);
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
        }
    }

    updateMonthlyChart(monthlySales) {
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) return;

        // Limpar container
        chartContainer.innerHTML = '';

        // Encontrar o máximo de vendas para escala
        const maxSales = Math.max(...monthlySales.map(item => item.vendas), 1);

        // Criar barras do gráfico
        monthlySales.forEach(monthData => {
            const height = (monthData.vendas / maxSales) * 100;
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
                ${monthData.mes}<br>
                Vendas: ${monthData.vendas}<br>
                Faturamento: ${this.formatCurrency(monthData.faturamento)}
            `;
            bar.appendChild(tooltip);

            chartContainer.appendChild(bar);
        });

        // Adicionar event listeners para tooltips
        this.setupChartTooltips();
    }

    updateRecentSales(recentSales) {
        const tableBody = document.getElementById('recentSalesTable');
        if (!tableBody) return;

        if (recentSales.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #7f8c8d;">
                        <i class="fas fa-info-circle"></i> Nenhuma venda recente encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = recentSales.map(sale => `
            <tr>
                <td>
                    <strong>${sale.marca} ${sale.modelo}</strong><br>
                    <small>${sale.ano} • ${sale.km ? sale.km.toLocaleString() + ' km' : 'N/A'}</small>
                </td>
                <td>${this.formatDate(sale.data_compra)}</td>
                <td><strong>${this.formatCurrency(sale.preco)}</strong></td>
                <td>
                    <span class="status sold">
                        Vendido
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateInventory(vehicles) {
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) return;

        if (vehicles.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="inventory-item" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-car" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                    <p>Nenhum veículo disponível no estoque</p>
                </div>
            `;
            return;
        }

        inventoryGrid.innerHTML = vehicles.map(vehicle => `
            <div class="inventory-item">
                <h3>${vehicle.marca} ${vehicle.modelo}</h3>
                <p><strong>Ano:</strong> ${vehicle.ano}</p>
                <p><strong>KM:</strong> ${vehicle.km ? vehicle.km.toLocaleString() : '0'}</p>
                <p><strong>Preço:</strong> ${this.formatCurrency(vehicle.preco)}</p>
                <span class="status available">Disponível</span>
                <div class="inventory-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.location.href='editar_estoque.html?id=${vehicle.id}'">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="salesDashboard.viewVehicleDetails(${vehicle.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </div>
            </div>
        `).join('');
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
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        if (tabBtns.length === 0) return;

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
                }
            });
        });
    }

    setupEventListeners() {
        // Botão de atualizar dados - verificar se existe antes de adicionar listener
        const refreshBtn = document.getElementById('refreshSales');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadSalesData());
        } else {
            console.warn('Botão refreshSales não encontrado');
        }
    }

    // Métodos auxiliares
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (e) {
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

    showLoading() {
        const refreshBtn = document.getElementById('refreshSales');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            refreshBtn.disabled = true;
        }
    }

    hideLoading() {
        const refreshBtn = document.getElementById('refreshSales');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Dados';
            refreshBtn.disabled = false;
        }
    }

    showError(message) {
        // Você pode usar um toast ou alerta mais sofisticado
        console.error('Erro no painel de vendas:', message);
        alert('Erro: ' + message);
    }

    viewVehicleDetails(vehicleId) {
        window.location.href = `editar_estoque.html?id=${vehicleId}`;
    }
}

// Variável global para acesso externo
let salesDashboard;

// Inicializar dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    salesDashboard = new SalesDashboard();
});