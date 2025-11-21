// Arquivo: js/componentsUsuario.js (VERSÃO CORRIGIDA)
$(document).ready(function () {
    console.log('📍 XAMPP - Carregando componentes...');
    
    // ✅ CAMINHO BASE PARA XAMPP
    const basePath = '../';
    
    console.log('🔄 XAMPP Base Path:', basePath);
    
    // Carregar header COM CORREÇÃO PREVENTIVA
    $("header").load(basePath + "usuario/general/header.html?nocache=" + Date.now(), function(response, status) {
        console.log('Header status:', status);
        if (status === "error") {
            console.error('❌ Erro ao carregar header');
            createFallbackHeader();
        } else {
            // ✅ CORREÇÃO PREVENTIVA APÓS CARREGAR
            setTimeout(() => {
                const fixedCount = fixHeaderLinks();
                if (fixedCount > 0) {
                    console.log(`🛡️ Correção preventiva aplicada: ${fixedCount} links corrigidos`);
                }
            }, 100);
        }
    });
    
    // Carregar footer  
    $("footer").load(basePath + "usuario/general/footer.html", function(response, status) {
        console.log('Footer status:', status);
        if (status === "error") {
            console.error('❌ Erro ao carregar footer');
        }
    });
    
    // Carregar menu
    $("body").append('<div class="sidebar-container"></div>');
    $(".sidebar-container").load(basePath + "usuario/general/menu.html", function(response, status) {
        console.log('Menu status:', status);
        if (status === "error") {
            console.error('❌ Erro ao carregar menu');
            createFallbackMenu();
        } else {
            initMenuEvents();
        }
    });
});

// ✅ CORREÇÃO DE LINKS DO HEADER
function fixHeaderLinks() {
    const headerLinks = document.querySelectorAll('header a[href^="/html/"]');
    let fixedCount = 0;
    
    headerLinks.forEach(link => {
        const oldHref = link.getAttribute('href');
        const newHref = oldHref.replace('/html/', '../');
        link.setAttribute('href', newHref);
        fixedCount++;
    });
    
    return fixedCount;
}

// ✅ HEADER DE FALLBACK
function createFallbackHeader() {
    $('header').html(`
        <header class="header">
            <div class="container">
                <div class="logo">
                    <h1>Apolo Carros</h1>
                </div>
                <nav class="nav">
                    <ul>
                        <li><a href="../index.html">Início</a></li>
                        <li><a href="../carros.html">Comprar</a></li>
                        <li><a href="../anunciar.html">Vender</a></li>
                        <li><a href="../financeiro.html">Financiamento</a></li>
                    </ul>
                </nav>
                <div class="auth-buttons">
                    <a href="../login.html" class="btn btn-outline">Entrar</a>
                </div>
            </div>
        </header>
    `);
}

// ✅ FALLBACK MENU PARA XAMPP
function createFallbackMenu() {
    $('.sidebar-container').html(`
        <aside class="sidebar">
            <div class="sidebar-header">
                <span class="close-sidebar">&times;</span>
            </div>
            <nav class="user-menu">
                <ul>
                    <li><a href="../index.html"><i class="fas fa-home"></i> Início</a></li>
                    <li><a href="usuario.html"><i class="fas fa-user"></i> Perfil</a></li>
                    <li><a href="../anunciar.html"><i class="fas fa-car"></i> Anunciar</a></li>
                    <li><a href="anuncios.html"><i class="fas fa-list"></i> Meus anúncios</a></li>
                    <li><a href="favoritos.html"><i class="fas fa-heart"></i> Favoritos</a></li>
                    <li><a href="../financeiro.html"><i class="fas fa-money-bill-wave"></i> Financiamento</a></li>
                    <li><a href="notificacoes.html"><i class="fas fa-bell"></i> Notificações</a></li>
                    <li><a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
                </ul>
            </nav>
        </aside>
        <div class="sidebar-overlay"></div>
    `);
}

// ✅ FUNÇÕES BÁSICAS DO MENU
function initMenuEvents() {
    console.log('🎯 Inicializando menu...');
    
    // Abrir menu
    $(document).on('click', '.menu-toggle', function() {
        $(".sidebar").addClass("active");
        $(".sidebar-overlay").addClass("active");
    });
    
    // Fechar menu
    $(document).on('click', '.sidebar-overlay, .close-sidebar', function() {
        $(".sidebar").removeClass("active");
        $(".sidebar-overlay").removeClass("active");
    });
}