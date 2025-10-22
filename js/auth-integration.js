// Arquivo: js/auth-integration.js
class AuthService {
    // ✅ CAMINHO CORRETO - baseado na estrutura do seu projeto
    static API_BASE_URL = '../backend/api/';

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
                window.location.href = '../index.html';
            }
            
            return result;
            
        } catch (error) {
            console.error('💥 Erro no logout:', error);
            
            // ✅ LIMPAR DADOS MESMO COM ERRO
            this.clearUserData();
            
            // ✅ REDIRECIONAR MESMO COM ERRO
            window.location.href = '../index.html';
            
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
}

// ✅ FUNÇÃO GLOBAL PARA LOGOUT
function logout() {
    AuthService.logout();
}

// ✅ VERIFICAÇÃO AUTOMÁTICA DE AUTENTICAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    // Para páginas que requerem admin
    if (window.location.pathname.includes('/adm/')) {
        const userData = AuthService.getUserData();
        if (!userData || userData.tipo_usuario !== 'admin') {
            alert('Acesso restrito a administradores.');
            window.location.href = '../login.html';
        }
    }
});