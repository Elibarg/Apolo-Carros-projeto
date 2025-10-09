$(document).ready(function () {
    const isXampp = window.location.href.includes('localhost') || 
                    window.location.href.includes('127.0.0.1');
    const basePath = isXampp ? '' : 'html/';
    
    $("nav").load(basePath + "../adm/general/menu.html");
});