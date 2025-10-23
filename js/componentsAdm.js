// js/componentsAdm.js - VERSÃO COMPLETA CORRIGIDA
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
    
    // ✅ SINCRONIZAR DADOS DO USUÁRIO COM API
    syncUserDataWithAPI();
    
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

// ✅ SISTEMA DE FALLBACK PARA IMAGENS
function loadImageWithFallback(imgElement, imageUrl, fallbackUrl) {
    return new Promise((resolve) => {
        if (!imageUrl) {
            imgElement.src = fallbackUrl;
            resolve(false);
            return;
        }
        
        // ✅ CORRIGIR CAMINHO RELATIVO SE NECESSÁRIO
        let finalImageUrl = imageUrl;
        if (imageUrl.startsWith('/Apolo-Carros-projeto/')) {
            // Já está no formato correto
        } else if (imageUrl.startsWith('/')) {
            finalImageUrl = '/Apolo-Carros-projeto' + imageUrl;
        } else if (!imageUrl.startsWith('http')) {
            finalImageUrl = '/Apolo-Carros-projeto/' + imageUrl;
        }
        
        const img = new Image();
        img.onload = function() {
            imgElement.src = finalImageUrl;
            console.log('✅ Avatar carregado com sucesso:', finalImageUrl);
            resolve(true);
        };
        img.onerror = function() {
            console.warn('❌ Imagem não carregada, usando fallback:', finalImageUrl);
            imgElement.src = fallbackUrl;
            resolve(false);
        };
        img.src = finalImageUrl;
    });
}

// ✅ SINCRONIZAR DADOS DO USUÁRIO COM API
async function syncUserDataWithAPI() {
    try {
        console.log('🔄 Sincronizando dados do usuário com API...');
        
        const response = await fetch('../../backend/api/get_user.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // ✅ ATUALIZAR LOCALSTORAGE COM DADOS FRESCOS
                AuthService.updateUserData(result.data);
                console.log('✅ Dados sincronizados com API');
                
                // ✅ ATUALIZAR HEADER IMEDIATAMENTE
                updateHeaderInfo();
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        return false;
    }
}

// ✅ ATUALIZAR INFORMAÇÕES DO HEADER (VERSÃO CORRIGIDA)
async function updateHeaderInfo() {
    const userData = AuthService.getUserData();
    
    if (userData) {
        console.log('👤 Atualizando header para:', userData.nome_completo);
        
        // ✅ ATUALIZAR NOME DO USUÁRIO
        $('#adminName').html(`${userData.nome_completo} <i class="fas fa-chevron-down"></i>`);
        
        // ✅ ATUALIZAR AVATAR COM FALLBACK E VERIFICAÇÃO
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            const success = await loadImageWithFallback(
                headerAvatar,
                userData.avatar_url,
                '../../img/avatars/default-avatar.jpg'
            );
            
            if (!success && userData.avatar_url) {
                console.warn('⚠️ Avatar URL inválida:', userData.avatar_url);
                
                // ✅ TENTAR SINCRONIZAR NOVAMENTE SE O AVATAR FALHOU
                setTimeout(() => {
                    syncUserDataWithAPI();
                }, 1000);
            }
        } else {
            console.warn('⚠️ Elemento headerAvatar não encontrado');
        }
        
        // ✅ ATUALIZAR TÍTULO DA PÁGINA E BREADCRUMB
        updatePageTitleAndBreadcrumb();
    } else {
        console.warn('⚠️ Nenhum usuário logado encontrado');
        
        // ✅ TENTAR SINCRONIZAR SE NÃO HÁ DADOS
        setTimeout(() => {
            syncUserDataWithAPI();
        }, 500);
    }
}

// ✅ ATUALIZAR TÍTULO E BREADCRUMB BASEADO NA PÁGINA ATUAL
function updatePageTitleAndBreadcrumb() {
    const currentPage = window.location.pathname.split('/').pop();
    
    const pageConfig = {
        'painel_de_vendas.html': {
            title: 'Dashboard',
            icon: 'fas fa-chart-line',
            breadcrumb: [] // ✅ CORRIGIDO: array vazio
        },
        'estoque.html': {
            title: 'Estoque de Veículos',
            icon: 'fas fa-car',
            breadcrumb: [] // ✅ CORRIGIDO: array vazio
        },
        'editar_estoque.html': {
            title: 'Editar Veículo',
            icon: 'fas fa-edit',
            breadcrumb: ['Estoque', 'Editar'] // ✅ CORRIGIDO: textos normais
        },
        'adicionar_carros.html': {
            title: 'Adicionar Veículo',
            icon: 'fas fa-plus',
            breadcrumb: ['Estoque', 'Adicionar'] // ✅ CORRIGIDO: textos normais
        },
        'clientes.html': {
            title: 'Usuários',
            icon: 'fas fa-users',
            breadcrumb: [] // ✅ CORRIGIDO: array vazio
        },
        'editar_cliente.html': {
            title: 'Editar Usuário',
            icon: 'fas fa-user-edit',
            breadcrumb: ['Usuários', 'Editar'] // ✅ CORRIGIDO: textos normais
        },
        'adicionar_clientes.html': {
            title: 'Adicionar Usuário',
            icon: 'fas fa-user-plus',
            breadcrumb: ['Usuários', 'Adicionar'] // ✅ CORRIGIDO: textos normais
        },
        'perfil_adm.html': {
            title: 'Meu Perfil',
            icon: 'fas fa-user',
            breadcrumb: [] // ✅ CORRIGIDO: array vazio
        }
    };

    const config = pageConfig[currentPage] || {
        title: 'Painel Admin',
        icon: 'fas fa-home',
        breadcrumb: [] // ✅ CORRIGIDO: array vazio
    };
    
    // ✅ ATUALIZAR TÍTULO
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.innerHTML = `<i class="${config.icon}"></i> ${config.title}`;
    }
    
    // ✅ ATUALIZAR BREADCRUMB (APENAS SE HOUVER ITENS)
    updateBreadcrumb(config.breadcrumb);
}

// ✅ ATUALIZAR BREADCRUMB (VERSÃO CORRIGIDA)
function updateBreadcrumb(items) {
    const breadcrumbElement = document.getElementById('breadcrumb');
    if (!breadcrumbElement) return;
    
    // ✅ SE O ARRAY ESTIVER VAZIO, ESCONDER O BREADCRUMB
    if (!items || items.length === 0 || (items.length === 1 && items[0] === '')) {
        breadcrumbElement.style.display = 'none';
        return;
    }
    
    // ✅ MOSTRAR O BREADCRUMB SE HOUVER ITENS VÁLIDOS
    breadcrumbElement.style.display = 'flex';
    
    const breadcrumbHtml = items
        .filter(item => item !== '') // ✅ FILTRAR STRINGS VAZIAS
        .map((item, index) => {
            if (index === items.length - 1) {
                return `<span>${item}</span>`;
            } else {
                let link = '#';
                if (item === 'Estoque') link = 'estoque.html';
                if (item === 'Usuários') link = 'clientes.html';
                if (item === 'Dashboard') link = 'painel_de_vendas.html';
                if (item === 'Perfil') link = 'perfil_adm.html';
                
                return `<a href="${link}">${item}</a><i class="fas fa-chevron-right"></i>`;
            }
        }).join('');
    
    breadcrumbElement.innerHTML = breadcrumbHtml;
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
                <h2 id="pageTitle"><i class="fas fa-home"></i> Painel Admin</h2>
                <nav class="breadcrumb" id="breadcrumb">
                    <span>Dashboard</span>
                </nav>
            </div>
            <div class="header-right">
                <div class="user-dropdown">
                    <img id="headerAvatar" src="../../img/avatars/default-avatar.jpg" alt="Admin" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
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

// ✅ DIAGNÓSTICO DE AVATAR (para debugging)
function diagnoseAvatar() {
    const userData = AuthService.getUserData();
    console.group('🔍 DIAGNÓSTICO DO AVATAR');
    console.log('📁 Dados do usuário:', userData);
    console.log('🖼️ Avatar URL:', userData?.avatar_url);
    console.log('📍 Caminho completo:', window.location.origin + (userData?.avatar_url || ''));
    console.log('👤 User ID:', userData?.id);
    console.groupEnd();
    
    // Testar carregamento da imagem
    if (userData?.avatar_url) {
        const testImg = new Image();
        testImg.onload = () => console.log('✅ Avatar carrega corretamente');
        testImg.onerror = () => console.log('❌ Erro ao carregar avatar');
        testImg.src = userData.avatar_url;
    }
    
    // Forçar sincronização
    syncUserDataWithAPI();
}

// ✅ EXPORTAR FUNÇÕES PARA USO EXTERNO
window.AdminComponents = {
    updateHeaderInfo: updateHeaderInfo,
    updatePageTitleAndBreadcrumb: updatePageTitleAndBreadcrumb,
    syncUserDataWithAPI: syncUserDataWithAPI,
    diagnoseAvatar: diagnoseAvatar
};

// ✅ INICIALIZAÇÃO GLOBAL
window.updateAdminHeader = updateHeaderInfo;