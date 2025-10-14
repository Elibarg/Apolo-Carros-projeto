// js/auth-integration.js
class AuthService {
    static getBaseURL() {
        return 'http://localhost/Apolo-Carros-projeto/backend/public/index.php';
    }

    static async login(email, password) {
        try {
            console.log('🔐 Tentando login...', { email });
            
            const response = await fetch(`${this.getBaseURL()}?route=/api/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email, 
                    senha: password 
                })
            });
            
            console.log('📡 Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Resposta completa:', result);
            
            return result;
            
        } catch (error) {
            console.error('❌ Erro completo:', error);
            return { 
                success: false, 
                message: 'Erro de conexão: ' + error.message 
            };
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${this.getBaseURL()}?route=/api/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro de conexão:', error);
            return { 
                success: false, 
                message: 'Erro de conexão com o servidor' 
            };
        }
    }

    static async verifyToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${this.getBaseURL()}?route=/api/verify`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            return result.success && result.valid === true;
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            return false;
        }
    }

    static isAuthenticated() {
        return this.getToken() !== null;
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static saveAuth(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    static clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static logout() {
        this.clearAuth();
        window.location.href = '../html/login.html';
    }
}

// Debug helper
window.debugAuth = function() {
    console.log('🔍 Debug Auth:', {
        isAuthenticated: AuthService.isAuthenticated(),
        token: AuthService.getToken(),
        user: AuthService.getUser(),
        baseURL: AuthService.getBaseURL()
    });
};

// Teste automático da API
window.testAPI = async function() {
    console.log('🧪 Testando API...');
    
    try {
        // Teste básico
        const response = await fetch(AuthService.getBaseURL());
        const result = await response.json();
        console.log('✅ API básica:', result);
        
        // Teste veículos
        const vehiclesResponse = await fetch(`${AuthService.getBaseURL()}?route=/api/vehicles`);
        const vehiclesResult = await vehiclesResponse.json();
        console.log('✅ API Veículos:', vehiclesResult);
        
        return true;
    } catch (error) {
        console.error('❌ Teste API falhou:', error);
        return false;
    }
};
// Proteção de rotas
function requireAuth(redirectTo = '../html/login.html') {
    if (!AuthService.isAuthenticated()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Verificar autenticação ao carregar a página
async function checkAuth() {
    if (!AuthService.isAuthenticated()) {
        return false;
    }

    const isValid = await AuthService.verifyToken();
    if (!isValid) {
        AuthService.clearAuth();
        window.location.href = '../html/login.html';
        return false;
    }

    return true;
}

// Debug helper
window.debugAuth = function() {
    console.log('🔍 Debug Auth:', {
        isAuthenticated: AuthService.isAuthenticated(),
        token: AuthService.getToken(),
        user: AuthService.getUser(),
        baseURL: AuthService.getBaseURL()
    });
};

// Proteção de rotas
function requireAuth(redirectTo = '../html/login.html') {
    if (!AuthService.isAuthenticated()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Verificar autenticação ao carregar a página
async function checkAuth() {
    if (!AuthService.isAuthenticated()) {
        return false;
    }

    const isValid = await AuthService.verifyToken();
    if (!isValid) {
        AuthService.clearAuth();
        window.location.href = '../html/login.html';
        return false;
    }

    return true;
}

// Inicializar verificação em páginas protegidas
document.addEventListener('DOMContentLoaded', function() {
    const protectedPages = [
        '/html/usuario/',
        '/html/adm/',
        '/html/anunciar.html'
    ];

    const currentPath = window.location.pathname;
    const isProtected = protectedPages.some(page => currentPath.includes(page));

    if (isProtected) {
        checkAuth();
    }
});