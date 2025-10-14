// js/components.js
$(document).ready(function() {
    // DETECTAR SE ESTÁ NO XAMPP OU NA PASTA LOCAL
    function getBasePath() {
        const path = window.location.pathname;
        
        if (path.includes('/html/usuario/') || path.includes('/html/adm/')) {
            return '../../';
        }
        
        if (path.includes('/html/')) {
            return '../';
        }
        
        if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
            return '';
        }
        
        return 'html/';
    }
    
    const basePath = getBasePath();
    
    console.log('🔄 Modo:', window.location.href.includes('localhost') ? 'XAMPP' : 'Local');
    console.log('📍 Base Path:', basePath);
    console.log('📁 URL atual:', window.location.pathname);
    
    // Carregar header
    $("header").load(basePath + "general/header.html", function(response, status) {
        console.log('Header:', status);
        if (status === "success") {
            updateHeaderAuth();
        }
    });
    
    // Carregar navegação
    $("nav").load(basePath + "general/menu.html", function(response, status) {
        console.log('Nav:', status);
    });
    
    // Carregar footer
    $("footer").load(basePath + "general/footer.html", function(response, status) {
        console.log('Footer:', status);
        updateFooterYear();
    });
});

// Atualizar header baseado na autenticação
function updateHeaderAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (!authButtons) return;
    
    if (user) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <span>Olá, ${user.nome_completo.split(' ')[0]}</span>
                <div class="dropdown">
                    <a href="${user.isAdmin ? '../html/adm/painel_de_vendas.html' : '../html/usuario/usuario.html'}">Minha Conta</a>
                    <a href="#" onclick="AuthService.logout()">Sair</a>
                </div>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="../html/login.html" class="btn btn-outline">Login</a>
            <a href="../html/cadastro.html" class="btn btn-primary">Cadastrar</a>
        `;
    }
}

// Atualizar ano no footer
function updateFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}