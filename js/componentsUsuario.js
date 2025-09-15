$(document).ready(function () {
    $("header").load("/html/usuario/general/header.html");
    $("nav").load("/html/usuario/general/menu.html");
    $("footer").load("/html/usuario/general/footer.html");
});
$(document).ready(function () {
    // Carregar header
    $("header").load("header.html", function () {
        // Carregar menu depois que o header estiver pronto
        $("body").append('<div class="sidebar-container"></div>');
        $(".sidebar-container").load("menu.html", function () {
            
            // Agora que header e menu foram carregados, ativamos os eventos
            $(".menu-toggle").click(function () {
                $(".sidebar").addClass("active");
                $(".sidebar-overlay").addClass("active");
            });

            $(".sidebar-overlay").click(function () {
                $(".sidebar").removeClass("active");
                $(this).removeClass("active");
            });
        });
    });
    $(document).ready(function () {
    // abrir
    $(".menu-toggle").click(function () {
        $(".sidebar").addClass("active");
        $(".sidebar-overlay").addClass("active");
    });

    // fechar clicando no X
    $(document).on("click", ".close-sidebar", function () {
        $(".sidebar").removeClass("active");
        $(".sidebar-overlay").removeClass("active");
    });

    // fechar clicando fora
    $(".sidebar-overlay").click(function () {
        $(".sidebar").removeClass("active");
        $(this).removeClass("active");
    });
});


    // Rodapé
    $("footer").load("footer.html");
});
