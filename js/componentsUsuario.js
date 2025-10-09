$(document).ready(function () {
    console.log('📍 Iniciando carregamento componentes usuário...');
    
    // ✅ DETECTAR SE ESTÁ NO XAMPP OU LOCAL
    const isXampp = window.location.href.includes('localhost') || 
                    window.location.href.includes('127.0.0.1');
    const basePath = isXampp ? '' : 'html/';
    
    console.log('🔄 Base Path:', basePath);
    console.log('📁 URL atual:', window.location.pathname);
    
    // ✅ CORRIGIR CAMINHOS - REMOVER "../" EXTRA
    $("header").load(basePath + "../usuario/general/header.html", function(response, status) {
        console.log('Header usuário status:', status);
        if (status === "error") {
            console.error('❌ Erro ao carregar header:', response);
        }
    });
    
    $("footer").load(basePath + "../usuario/general/footer.html", function(response, status) {
        console.log('Footer usuário status:', status);
        if (status === "error") {
            console.error('❌ Erro ao carregar footer:', response);
        }
    });
    
    // ✅ CARREGAR MENU LATERAL
    $("body").append('<div class="sidebar-container"></div>');
    $(".sidebar-container").load(basePath + "../usuario/general/menu.html", function(response, status) {
        console.log('Menu usuário status:', status);
        
        if (status === "error") {
            console.error('❌ Erro ao carregar menu:', response);
            return;
        }
        
        console.log('✅ Menu usuário carregado com sucesso!');
        
        // ✅ INICIALIZAR EVENTOS DO MENU
        initUserMenu();
    });
});

// ✅ FUNÇÃO PARA INICIALIZAR MENU DO USUÁRIO
function initUserMenu() {
    console.log('🎯 Inicializando eventos do menu usuário...');
    
    // Abrir menu
    $(".menu-toggle").click(function () {
        console.log('📱 Abrindo menu lateral...');
        $(".sidebar").addClass("active");
        $(".sidebar-overlay").addClass("active");
    });

    // Fechar menu
    $(".sidebar-overlay, .close-sidebar").click(function () {
        console.log('❌ Fechando menu lateral...');
        $(".sidebar").removeClass("active");
        $(".sidebar-overlay").removeClass("active");
    });
    
    // ✅ ATUALIZAR DADOS DO USUÁRIO NO MENU (se estiver logado)
    updateUserMenuData();
}

// ✅ ATUALIZAR DADOS DO USUÁRIO NO MENU
function updateUserMenuData() {
    const userData = localStorage.getItem('user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('👤 Usuário logado:', user.nome_completo);
            
            // Atualizar informações no menu
            $(".user-profile h3").text(user.nome_completo);
            $(".user-profile p").text(user.email);
            
            // ✅ ADICIONAR BOTÃO DE LOGOUT DINÂMICO
            if (!$('.logout-btn').length) {
                $('.user-menu').append(`
                    <li>
                        <a href="#" class="logout-btn" onclick="logoutUser()">
                            <i class="fas fa-sign-out-alt"></i> Sair
                        </a>
                    </li>
                `);
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    } else {
        console.log('⚠️ Usuário não está logado');
        // Redirecionar para login se não estiver logado
        // window.location.href = 'login.html';
    }
}

// ✅ FUNÇÃO DE LOGOUT
function logoutUser() {
    if (confirm('Deseja realmente sair?')) {
        const token = localStorage.getItem('token');
        
        if (token) {
            fetch('/backend/public/index.php?route=/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Limpar localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    // Redirecionar para login
                    window.location.href = '../login.html';
                } else {
                    alert('Erro ao fazer logout: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                // Limpar mesmo com erro
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../login.html';
            });
        } else {
            // Limpar e redirecionar mesmo sem token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
        }
    }
}

// ✅ VERIFICAR AUTENTICAÇÃO AO CARREGAR PÁGINA
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log('🔒 Usuário não autenticado, redirecionando...');
        window.location.href = '../login.html';
        return false;
    }
    
    // Verificar se token ainda é válido
    fetch('/backend/public/index.php?route=/api/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(result => {
        if (!result.valid) {
            console.log('❌ Token inválido, redirecionando...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../login.html';
        }
    })
    .catch(error => {
        console.error('Erro ao verificar token:', error);
    });
    
    return true;
}

// ✅ INICIALIZAR VERIFICAÇÃO DE AUTENTICAÇÃO
$(document).ready(function() {
    // Verificar autenticação apenas em páginas que requerem login
    if (window.location.pathname.includes('/usuario/')) {
        if (!checkAuth()) {
            return; // Não continuar carregando se não estiver autenticado
        }
    }
});