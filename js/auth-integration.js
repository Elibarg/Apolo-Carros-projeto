// Arquivo: js/auth-integration.js
class AuthService {
    // ✅ CORRIGIDO PARA XAMPP
    static API_BASE_URL = '/Apolo-Carros-projeto/backend/api/';

    static async register(userData) {
        console.log('📤 Enviando dados para:', this.API_BASE_URL + 'register.php');
        
        try {
            const response = await fetch(this.API_BASE_URL + 'register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            console.log('📥 Status da resposta:', response.status);
            
            const result = await response.json();
            console.log('📊 Resultado:', result);
            
            return result;
            
        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            return { 
                success: false, 
                message: 'Erro de conexão: ' + error.message
            };
        }
    }

    static async login(email, password) {
        console.log('📤 Login para:', this.API_BASE_URL + 'login.php');
        
        try {
            const response = await fetch(this.API_BASE_URL + 'login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email, 
                    senha: password 
                })
            });

            console.log('📥 Status do login:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📊 Resultado login:', result);
            
            return result;
            
        } catch (error) {
            console.error('💥 Erro no login:', error);
            return { 
                success: false, 
                message: 'Erro de conexão: ' + error.message
            };
        }
    }

    static async checkAuth() {
        try {
            const response = await fetch(this.API_BASE_URL + 'check_session.php');
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return { logged_in: false };
        }
    }

    static async logout() {
        try {
            console.log('🚪 Iniciando logout...');
            console.log('📤 URL do logout:', this.API_BASE_URL + 'logout.php');
            
            const response = await fetch(this.API_BASE_URL + 'logout.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📥 Status do logout:', response.status);
            
            // ✅ TENTAR LER A RESPOSTA MESMO COM ERRO
            let result;
            try {
                result = await response.json();
            } catch (e) {
                result = { 
                    success: false, 
                    message: 'Erro ao processar resposta'
                };
            }
            
            console.log('📊 Resultado logout:', result);
            
            // ✅ SEMPRE LIMPAR DADOS LOCAIS
            this.clearUserData();
            
            // ✅ REDIRECIONAR
            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                window.location.href = '/Apolo-Carros-projeto/html/index.html';
            }
            
            return result;
            
        } catch (error) {
            console.error('💥 Erro no logout:', error);
            
            // ✅ LIMPAR DADOS MESMO COM ERRO
            this.clearUserData();
            
            // ✅ REDIRECIONAR MESMO COM ERRO
            window.location.href = '/Apolo-Carros-projeto/html/index.html';
            
            return { 
                success: false, 
                message: 'Logout realizado (erro ignorado)' 
            };
        }
    }

    // ✅ MÉTODO CORRIGIDO
    static clearUserData() {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        sessionStorage.removeItem('user_token');
        sessionStorage.removeItem('user_data');
        console.log('🧹 Dados do usuário removidos');
    }

    static saveAuth(token, userData) {
        localStorage.setItem('user_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        console.log('🔐 Dados salvos:', userData);
    }

    static getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    static isAuthenticated() {
        return localStorage.getItem('user_token') !== null;
    }

    static isAdmin() {
        const userData = this.getUserData();
        return userData && userData.tipo_usuario === 'admin';
    }

    static getUserType() {
        const userData = this.getUserData();
        return userData ? userData.tipo_usuario : null;
    }

    // ✅ NOVO MÉTODO: Verificar autenticação em páginas protegidas
    static requireAuth(redirectTo = '/Apolo-Carros-projeto/html/login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    // ✅ NOVO MÉTODO: Verificar se é admin
    static requireAdmin(redirectTo = '/Apolo-Carros-projeto/html/login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        
        if (!this.isAdmin()) {
            alert('Acesso restrito a administradores.');
            window.location.href = '/Apolo-Carros-projeto/html/index.html';
            return false;
        }
        
        return true;
    }

    // ✅ NOVO MÉTODO: Atualizar dados do usuário
    static updateUserData(newData) {
        const currentData = this.getUserData();
        if (currentData) {
            const updatedData = { ...currentData, ...newData };
            localStorage.setItem('user_data', JSON.stringify(updatedData));
            console.log('🔐 Dados do usuário atualizados:', updatedData);
        }
    }

    // ✅ NOVO MÉTODO: Verificar token expirado
    static isTokenExpired() {
        // Implementar lógica de verificação de expiração do token se necessário
        return false;
    }

    // ✅ NOVO MÉTODO: Redirecionar baseado no tipo de usuário
    static redirectByUserType() {
        const userData = this.getUserData();
        if (userData) {
            if (userData.tipo_usuario === 'admin') {
                window.location.href = '/Apolo-Carros-projeto/html/adm/painel_de_vendas.html';
            } else {
                window.location.href = '/Apolo-Carros-projeto/html/index.html';
            }
        }
    }
}

// ✅ FUNÇÃO GLOBAL PARA LOGOUT
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        AuthService.logout();
    }
}

// ✅ VERIFICAÇÃO AUTOMÁTICA DE AUTENTICAÇÃO EM PÁGINAS PROTEGIDAS
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    // Páginas que requerem autenticação
    const protectedPages = [
        '/Apolo-Carros-projeto/html/adm/',
        '/Apolo-Carros-projeto/html/perfil/'
    ];
    
    // Páginas que requerem admin
    const adminPages = [
        '/Apolo-Carros-projeto/html/adm/'
    ];
    
    // Verificar se está em uma página protegida
    const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
    const isAdminPage = adminPages.some(page => currentPath.includes(page));
    
    if (isProtectedPage) {
        if (isAdminPage) {
            AuthService.requireAdmin();
        } else {
            AuthService.requireAuth();
        }
    }
    
    // ✅ ATUALIZAR INTERFACE COM DADOS DO USUÁRIO
    const userData = AuthService.getUserData();
    if (userData) {
        // Atualizar elementos com classe 'user-name'
        document.querySelectorAll('.user-name').forEach(element => {
            element.textContent = userData.nome_completo;
        });
        
        // Atualizar elementos com classe 'user-email'
        document.querySelectorAll('.user-email').forEach(element => {
            element.textContent = userData.email;
        });
        
        // Atualizar elementos com classe 'user-type'
        document.querySelectorAll('.user-type').forEach(element => {
            element.textContent = userData.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário';
        });
    }
});

// ✅ EXPORTAR PARA USO EM MÓDULOS (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}