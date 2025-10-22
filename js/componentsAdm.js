// js/componentsAdm.js - VERSÃO SIMPLIFICADA E FUNCIONAL
$(document).ready(function () {
    console.log('🚀 Iniciando carregamento do admin...');
    
    // ✅ CAMINHO CORRETO para o menu
    const menuPath = '../../html/adm/general/menu.html';
    console.log('📁 Carregando menu de:', menuPath);
    
    // ✅ CARREGAR MENU
    $("nav").load(menuPath, function(response, status) {
        console.log('📡 Status do menu:', status);
        
        if (status === "success") {
            console.log('✅ Menu carregado com sucesso!');
            initializeAdmin();
        } else {
            console.error('❌ Erro ao carregar menu:', response);
            createFallbackMenu();
        }
    });
});

function initializeAdmin() {
    console.log('🎯 Inicializando funcionalidades do admin...');
    
    // ✅ TOGGLE DO MENU MOBILE
    $(document).on('click', '.menu-toggle', function() {
        console.log('📱 Abrindo/fechando menu mobile');
        $('.admin-sidebar').toggleClass('active');
    });
    
    // ✅ BOTÃO FECHAR
    $(document).on('click', '.close-btn', function() {
        console.log('❌ Fechando menu');
        $('.admin-sidebar').removeClass('active');
    });
    
    // ✅ DROPDOWN DO USUÁRIO
    $(document).on('click', '.user-dropdown', function(e) {
        e.stopPropagation();
        console.log('👤 Alternando dropdown');
        $(this).toggleClass('active');
    });
    
    // ✅ FECHAR DROPDOWN AO CLICAR FORA
    $(document).click(function() {
        $('.user-dropdown').removeClass('active');
    });
    
    // ✅ ATUALIZAR USUÁRIO LOGADO
    updateUserInfo();
    
    console.log('✅ Admin inicializado com sucesso!');
}

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
        console.log('👤 Usuário logado:', user.nome_completo);
        // O nome será atualizado no header principal, não no menu
    }
}

function createFallbackMenu() {
    console.log('🛠️ Criando menu de fallback...');
    $("nav").html(`
        <aside class="admin-sidebar">
            <div class="admin-logo">
                <h1>Apolo Carros</h1>
                <p>Menu Fallback</p>
            </div>
            <nav class="admin-menu">
                <ul>
                    <li><a href="painel_de_vendas.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
                    <li><a href="estoque.html"><i class="fas fa-car"></i> Estoque</a></li>
                    <li><a href="clientes.html"><i class="fas fa-users"></i> Usuários</a></li>
                </ul>
            </nav>
        </aside>
        <header class="admin-header">
            <div class="header-left">
                <div class="menu-toggle">
                    <i class="fas fa-bars"></i>
                    <span>Menu</span>
                </div>
                <h2>Painel Admin</h2>
            </div>
        </header>
    `);
    initializeAdmin();
}