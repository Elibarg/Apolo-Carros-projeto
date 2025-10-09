$(document).ready(function() {
    // DETECTAR SE ESTÁ NO XAMPP OU NA PASTA LOCAL
    const isXampp = window.location.href.includes('localhost') || 
                    window.location.href.includes('127.0.0.1');
    
    const basePath = isXampp ? '' : 'html/';
    
    console.log('🔄 Modo:', isXampp ? 'XAMPP' : 'Local');
    console.log('📍 Base Path:', basePath);
    
    $("header").load(basePath + "general/header.html", function(response, status) {
        console.log('Header:', status);
    });
    
    $("nav").load(basePath + "general/menu.html", function(response, status) {
        console.log('Nav:', status);
    });
    
    $("footer").load(basePath + "general/footer.html", function(response, status) {
        console.log('Footer:', status);
    });
});