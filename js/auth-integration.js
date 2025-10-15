// Arquivo: js/auth-integration.js
class AuthService {
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
        console.log('🔐 Credenciais:', { email, password: '***' });
        
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
            const response = await fetch(this.API_BASE_URL + 'logout.php');
            const result = await response.json();
            
            if (result.success) {
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_data');
                window.location.href = '../html/index.html';
            }
            
            return result;
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, message: 'Erro de conexão' };
        }
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

// Função de teste
async function testAPIConnection() {
    console.log('🔍 Testando conexão com API...');
    
    try {
        const response = await fetch(AuthService.API_BASE_URL + 'test_connection.php');
        const result = await response.json();
        console.log('✅ Teste API:', result);
        return result;
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return { success: false, message: error.message };
    }
}