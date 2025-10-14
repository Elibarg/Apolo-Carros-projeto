// js/admin-dashboard.js
class AdminDashboardService {
    static async getStats() {
        try {
            const token = AuthService.getToken();
            const response = await fetch('/backend/public/index.php?route=/api/admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            return { success: false, message: 'Erro ao carregar estatísticas' };
        }
    }

    static async getUsers(filters = {}) {
        try {
            const token = AuthService.getToken();
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`/backend/public/index.php?route=/api/admin/users?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return { success: false, message: 'Erro ao carregar usuários' };
        }
    }

    static async getContacts(filters = {}) {
        try {
            const token = AuthService.getToken();
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`/backend/public/index.php?route=/api/admin/contacts?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            return { success: false, message: 'Erro ao carregar contatos' };
        }
    }

    static async updateUserStatus(userId, status) {
        try {
            const token = AuthService.getToken();
            const response = await fetch(`/backend/public/index.php?route=/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return { success: false, message: 'Erro ao atualizar usuário' };
        }
    }

    static async deleteUser(userId) {
        try {
            const token = AuthService.getToken();
            const response = await fetch(`/backend/public/index.php?route=/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            return { success: false, message: 'Erro ao excluir usuário' };
        }
    }
}

// Inicializar dashboard
async function initDashboard() {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }

    const statsResult = await AdminDashboardService.getStats();
    
    if (statsResult.success) {
        const stats = statsResult.data;
        updateStatsCards(stats);
        updateRecentSales(stats.recent_sales);
    } else {
        console.error('Erro ao carregar dashboard:', statsResult.message);
        showError('Erro ao carregar dashboard');
    }
}

function updateStatsCards(stats) {
    // Atualizar cards de estatísticas
    if (stats.user_stats) {
        document.getElementById('total-users').textContent = stats.user_stats.total;
        document.getElementById('active-users').textContent = stats.user_stats.active;
        document.getElementById('new-users-today').textContent = stats.user_stats.new_today;
    }
    
    if (stats.vehicle_stats) {
        document.getElementById('total-vehicles').textContent = stats.vehicle_stats.total;
        document.getElementById('active-vehicles').textContent = stats.vehicle_stats.active;
        document.getElementById('new-vehicles-today').textContent = stats.vehicle_stats.new_today;
    }
    
    if (stats.contact_stats) {
        document.getElementById('total-contacts').textContent = stats.contact_stats.total;
        document.getElementById('pending-contacts').textContent = stats.contact_stats.pending;
    }
}

function updateRecentSales(sales) {
    const container = document.getElementById('recent-sales');
    if (!container || !sales) return;

    if (sales.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma venda recente</p>';
        return;
    }

    container.innerHTML = sales.map(sale => `
        <div class="sale-item">
            <div class="sale-info">
                <h4>${sale.vehicle}</h4>
                <p>Cliente: ${sale.customer}</p>
                <small>${new Date(sale.date).toLocaleDateString('pt-BR')}</small>
            </div>
            <div class="sale-amount">
                R$ ${sale.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
        </div>
    `).join('');
}

// Gerenciamento de usuários
async function loadUsers() {
    const result = await AdminDashboardService.getUsers();
    
    if (result.success) {
        renderUsersTable(result.data.users);
    } else {
        showError('Erro ao carregar usuários');
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhum usuário encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.nome_completo}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${user.tipo === 'admin' ? 'badge-admin' : 'badge-user'}">
                    ${user.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                </span>
            </td>
            <td>
                <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">
                    ${user.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
            <td class="actions">
                <button class="btn btn-sm btn-outline" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }

    const result = await AdminDashboardService.deleteUser(userId);
    
    if (result.success) {
        showSuccess('Usuário excluído com sucesso');
        loadUsers();
    } else {
        showError('Erro ao excluir usuário: ' + result.message);
    }
}

function editUser(userId) {
    window.location.href = `editar_cliente.html?id=${userId}`;
}

// Funções de utilidade
function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

// Carregar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('painel_de_vendas.html')) {
        initDashboard();
    }
    
    if (window.location.pathname.includes('clientes.html')) {
        loadUsers();
    }
});