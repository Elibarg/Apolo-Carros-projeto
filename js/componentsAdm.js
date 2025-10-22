// js/componentsAdm.js - VERSÃO ATUALIZADA COM HEADER
$(document).ready(function () {
    console.log('🚀 Iniciando carregamento do admin...');
    
    // ✅ CAMINHOS CORRETOS
    const menuPath = '../../html/adm/general/menu.html';
    const headerPath = '../../html/adm/general/header.html';
    
    console.log('📁 Carregando componentes...');
    
    // ✅ CARREGAR MENU
    $("nav").load(menuPath, function(response, status) {
        console.log('📡 Status do menu:', status);
        
        if (status === "success") {
            console.log('✅ Menu carregado com sucesso!');
            // Agora carrega o header
            loadHeader();
        } else {
            console.error('❌ Erro ao carregar menu:', response);
            createFallbackMenu();
        }
    });
});

function loadHeader() {
    const headerPath = '../../html/adm/general/header.html';
    
    $("header").load(headerPath, function(response, status) {
        console.log('📡 Status do header:', status);
        
        if (status === "success") {
            console.log('✅ Header carregado com sucesso!');
            initializeAdmin();
            updateHeaderInfo();
        } else {
            console.error('❌ Erro ao carregar header:', response);
            createFallbackHeader();
        }
    });
}

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
    
    // ✅ CONFIGURAR LOGOUT
    $(document).on('click', '#logoutBtn', function(e) {
        e.preventDefault();
        console.log('🚪 Iniciando logout...');
        if (confirm('Tem certeza que deseja sair?')) {
            AuthService.logout();
        }
    });
    
    console.log('✅ Admin inicializado com sucesso!');
}

// ✅ ATUALIZAR INFORMAÇÕES DO HEADER
function updateHeaderInfo() {
    const userData = AuthService.getUserData();
    
    if (userData) {
        console.log('👤 Atualizando header para:', userData.nome_completo);
        
        // ✅ ATUALIZAR NOME DO USUÁRIO
        $('#adminName').html(`${userData.nome_completo} <i class="fas fa-chevron-down"></i>`);
        
        // ✅ ATUALIZAR AVATAR (se existir)
        if (userData.avatar_url) {
            $('#headerAvatar').attr('src', userData.avatar_url);
        }
        
        // ✅ ATUALIZAR TÍTULO DA PÁGINA E BREADCRUMB
        updatePageTitleAndBreadcrumb();
    } else {
        console.warn('⚠️ Nenhum usuário logado encontrado');
    }
}

// ✅ ATUALIZAR TÍTULO E BREADCRUMB BASEADO NA PÁGINA ATUAL
function updatePageTitleAndBreadcrumb() {
    const currentPage = window.location.pathname.split('/').pop();
    const pageConfig = {
        'painel_de_vendas.html': {
            title: 'Dashboard',
            icon: 'fas fa-chart-line',
            breadcrumb: ['Dashboard']
        },
        'estoque.html': {
            title: 'Estoque de Veículos',
            icon: 'fas fa-car',
            breadcrumb: ['Estoque']
        },
        'editar_estoque.html': {
            title: 'Editar Veículo',
            icon: 'fas fa-edit',
            breadcrumb: ['Estoque', 'Editar']
        },
        'adicionar_carros.html': {
            title: 'Adicionar Veículo',
            icon: 'fas fa-plus',
            breadcrumb: ['Estoque', 'Adicionar']
        },
        'clientes.html': {
            title: 'Usuários',
            icon: 'fas fa-users',
            breadcrumb: ['Usuários']
        },
        'editar_cliente.html': {
            title: 'Editar Usuário',
            icon: 'fas fa-user-edit',
            breadcrumb: ['Usuários', 'Editar']
        },
        'adicionar_clientes.html': {
            title: 'Adicionar Usuário',
            icon: 'fas fa-user-plus',
            breadcrumb: ['Usuários', 'Adicionar']
        },
        'perfil_adm.html': {
            title: 'Meu Perfil',
            icon: 'fas fa-user',
            breadcrumb: ['Perfil']
        }
    };
    
    const config = pageConfig[currentPage] || {
        title: 'Dashboard',
        icon: 'fas fa-home',
        breadcrumb: ['Dashboard']
    };
    
    // ✅ ATUALIZAR TÍTULO
    $('#pageTitle').html(`<i class="${config.icon}"></i> ${config.title}`);
    
    // ✅ ATUALIZAR BREADCRUMB
    updateBreadcrumb(config.breadcrumb);
}

// ✅ ATUALIZAR BREADCRUMB
function updateBreadcrumb(items) {
    const breadcrumbHtml = items.map((item, index) => {
        if (index === items.length - 1) {
            return `<span>${item}</span>`;
        } else {
            // Links para páginas anteriores (simplificado)
            let link = '#';
            if (item === 'Estoque') link = 'estoque.html';
            if (item === 'Usuários') link = 'clientes.html';
            if (item === 'Dashboard') link = 'painel_de_vendas.html';
            if (item === 'Perfil') link = 'perfil_adm.html';
            
            return `<a href="${link}">${item}</a><i class="fas fa-chevron-right"></i>`;
        }
    }).join('');
    
    $('#breadcrumb').html(breadcrumbHtml);
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
                    <li><a href="perfil_adm.html"><i class="fas fa-user"></i> Perfil</a></li>
                </ul>
            </nav>
        </aside>
    `);
    loadHeader();
}

function createFallbackHeader() {
    console.log('🛠️ Criando header de fallback...');
    $("header").html(`
        <header class="admin-header">
            <div class="header-left">
                <div class="menu-toggle">
                    <i class="fas fa-bars"></i>
                    <span>Menu</span>
                </div>
                <h2><i class="fas fa-home"></i> Painel Admin</h2>
            </div>
            <div class="header-right">
                <div class="user-dropdown">
                    <img src="../../img/avatars/default-avatar.jpg" alt="Admin">
                    <span id="adminName">Admin <i class="fas fa-chevron-down"></i></span>
                    <div class="dropdown-menu">
                        <a href="perfil_adm.html"><i class="fas fa-user"></i> Perfil</a>
                        <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Sair</a>
                    </div>
                </div>
            </div>
        </header>
    `);
    initializeAdmin();
    updateHeaderInfo();
}

// ✅ EXPORTAR FUNÇÕES PARA USO EXTERNO
window.AdminComponents = {
    updateHeaderInfo: updateHeaderInfo,
    updatePageTitleAndBreadcrumb: updatePageTitleAndBreadcrumb
};