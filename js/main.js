// =============================================
// SUMÁRIO DO CÓDIGO JAVASCRIPT
// =============================================

/*
1. MENU MOBILE (linhas X-X)
   - Manipula: .mobile-menu, .nav, .auth-buttons
   - Páginas: Todas (presente no header de todas)
   - Função: Alterna visibilidade do menu em mobile

2. GALERIA DE IMAGENS (linhas X-X)
   - Manipula: .thumbnail, .main-image img
   - Páginas: detalhes.html
   - Função: Troca imagem principal ao clicar em miniaturas

3. UPLOAD DE IMAGENS (linhas X-X)
   - Manipula: .upload-area, #car-images, .preview-grid
   - Páginas: anunciar.html
   - Função: Pré-visualização de imagens selecionadas

4. CALCULADORA DE FINANCIAMENTO (linhas X-X)
   - Manipula: #calculate, #result, #car-value, #down-payment, #term
   - Páginas: financeiro.html
   - Função: Calcula parcelas de financiamento

5. ABAS DO PAINEL (linhas X-X)
   - Manipula: .tab-btn, .tab-content
   - Páginas: anuncios.html, favoritos.html, usuario.html
   - Função: Alterna entre abas de conteúdo

6. BOTÃO DE FAVORITOS (linhas X-X)
   - Manipula: .favorite, .remove-favorite, .fa-heart
   - Páginas: carros.html, detalhes.html, favoritos.html
   - Função: Gerencia favoritos (alterna estado/estilo)

7. INICIALIZAÇÃO GERAL (linhas X-X)
   - Manipula: #current-year
   - Páginas: Todas
   - Função: Inicializa todos os componentes e atualiza ano no footer
*/

// -----------------------------
// MENU MOBILE
// -----------------------------
function setupMobileMenu() {
    // Seleciona elementos do DOM usando querySelector (pega o primeiro elemento com a classe)
    const mobileMenuBtn = document.querySelector('.mobile-menu'); // Botão de menu mobile (ícone ☰)
    const nav = document.querySelector('.nav'); // Menu de navegação
    const authButtons = document.querySelector('.auth-buttons'); // Botões de login/cadastro

    // Verifica se os elementos existem antes de adicionar eventos
    if (mobileMenuBtn && nav) {
        // Adiciona um event listener para o evento de clique
        mobileMenuBtn.addEventListener('click', () => {
            // Alterna a classe 'show' no menu de navegação (se tiver, remove; se não tiver, adiciona)
            nav.classList.toggle('show');
            
            // Se existirem botões de autenticação, alterna a classe 'show' neles também
            if (authButtons) {
                authButtons.classList.toggle('show');
            }
        });
    }
}

// -----------------------------
// GALERIA DE IMAGENS (trocar imagem principal ao clicar nas miniaturas)
// -----------------------------
function setupImageGallery() {
    // Seleciona todas as miniaturas (querySelectorAll retorna NodeList)
    const thumbnails = document.querySelectorAll('.thumbnail');
    // Seleciona a imagem principal
    const mainImage = document.querySelector('.main-image img');

    // Verifica se existem miniaturas e imagem principal
    if (thumbnails.length && mainImage) {
        // Para cada miniatura, adiciona um evento de clique
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Pega a tag img dentro da miniatura
                const thumbImg = thumb.querySelector('img');
                if (thumbImg) {
                    // Troca os src das imagens (principal e miniatura)
                    const tempSrc = mainImage.src;
                    mainImage.src = thumbImg.src;
                    thumbImg.src = tempSrc;
                }
            });
        });
    }
}
// -----------------------------
// UPLOAD DE IMAGENS (com pré-visualização)
// -----------------------------
function setupImageUpload() {
    // Seleciona elementos do DOM
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.querySelector('#car-images');
    const previewGrid = document.querySelector('.preview-grid');

    if (uploadArea && fileInput && previewGrid) {
        // Quando clicar na área de upload, simula clique no input file
        uploadArea.addEventListener('click', () => {
            fileInput.click(); // Dispara o clique programático
        });

        // Quando arquivos forem selecionados
        fileInput.addEventListener('change', (e) => {
            // Pega a lista de arquivos selecionados
            const files = e.target.files;
            // Limpa o conteúdo anterior do preview
            previewGrid.innerHTML = '';

            // Itera sobre os arquivos (limitado a 12)
            for (let i = 0; i < files.length; i++) {
                if (i >= 12) break;

                // Cria um FileReader para ler o conteúdo do arquivo
                const reader = new FileReader();
                // Define o que acontece quando o arquivo terminar de carregar
                reader.onload = (event) => {
                    // Cria um container para a pré-visualização
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';

                    // Cria a imagem de preview
                    const img = document.createElement('img');
                    img.src = event.target.result; // Define o src como o conteúdo lido

                    // Cria botão de remover
                    const removeBtn = document.createElement('span');
                    removeBtn.className = 'remove-image';
                    removeBtn.innerHTML = '&times;'; // Adiciona um "X"
                    // Adiciona evento de clique para remover o preview
                    removeBtn.addEventListener('click', () => {
                        previewItem.remove();
                    });

                    // Adiciona elementos ao DOM
                    previewItem.appendChild(img);
                    previewItem.appendChild(removeBtn);
                    previewGrid.appendChild(previewItem);
                };
                // Inicia a leitura do arquivo como URL de dados
                reader.readAsDataURL(files[i]);
            }
        });
    }
}

// -----------------------------
// CALCULADORA DE FINANCIAMENTO
// -----------------------------
function setupFinanceCalculator() {
    // Seleciona elementos pelo ID
    const calculateBtn = document.getElementById('calculate');
    const resultDiv = document.getElementById('result');

    if (calculateBtn && resultDiv) {
        // Adiciona evento de clique ao botão calcular
        calculateBtn.addEventListener('click', () => {
            // Pega valores dos inputs e converte para números (com fallback para 0)
            const carValue = parseFloat(document.getElementById('car-value').value) || 0;
            const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
            const term = parseInt(document.getElementById('term').value) || 48;

            // Validações
            if (carValue <= 0) {
                alert('Por favor, insira um valor válido para o carro.');
                return;
            }

            if (downPayment >= carValue) {
                alert('O valor da entrada não pode ser maior ou igual ao valor do carro.');
                return;
            }

            // Cálculos financeiros
            const financedAmount = carValue - downPayment;
            const interestRate = 0.015; // 1.5% ao mês
            // Fórmula de parcelas com juros compostos
            const installment = (financedAmount * interestRate) / (1 - Math.pow(1 + interestRate, -term));
            const totalAmount = installment * term;

            // Atualiza a interface com os resultados
            document.getElementById('financed-amount').textContent = `R$ ${financedAmount.toFixed(2).replace('.', ',')}`;
            document.getElementById('installments').textContent = `${term}x R$ ${installment.toFixed(2).replace('.', ',')}`;
            document.getElementById('total-amount').textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;

            // Mostra o resultado
            resultDiv.style.display = 'block';
        });
    }
}

// -----------------------------
// ABAS DO PAINEL (ex: Anúncios, Favoritos)
// -----------------------------
function setupSalesTabs() {
    // Seleciona todos os botões de aba
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (tabBtns.length) {
        // Para cada botão de aba
        tabBtns.forEach(btn => {
            // Adiciona evento de clique
            btn.addEventListener('click', () => {
                // Remove a classe active de todos os botões
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                // Remove a classe active de todos os conteúdos
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                // Adiciona active ao botão clicado
                btn.classList.add('active');

                // Mostra o conteúdo correspondente
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
}

// -----------------------------
// BOTÃO DE FAVORITOS (coração)
// -----------------------------
function setupFavorites() {
    // Seleciona todos os botões de favorito
    const favoriteBtns = document.querySelectorAll('.favorite, .remove-favorite');

    // Para cada botão
    favoriteBtns.forEach(btn => {
        // Adiciona evento de clique
        btn.addEventListener('click', (e) => {
            // Previne o comportamento padrão (útil se o botão estiver em um link)
            e.preventDefault();
            // Alterna a classe active
            btn.classList.toggle('active');

            // Se for um ícone de coração (Font Awesome)
            if (btn.classList.contains('fa-heart')) {
                if (btn.classList.contains('active')) {
                    // Muda para coração preenchido e vermelho
                    btn.classList.replace('far', 'fas');
                    btn.style.color = '#e74c3c';
                } else {
                    // Volta para coração vazio e cor padrão
                    btn.classList.replace('fas', 'far');
                    btn.style.color = '';
                }
            }
        });
    });
}

// -----------------------------
// INICIALIZAÇÃO GERAL
// -----------------------------
// Quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Chama todas as funções de setup
    setupMobileMenu();
    setupImageGallery();
    setupImageUpload();
    setupFinanceCalculator();
    setupSalesTabs();
    setupFavorites();

    // Atualiza o ano no footer automaticamente
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// =============================================
// Validação do Formulário de Contato 
// =============================================

function setupContactForm() {
    // Pega o formulário pelo ID
    const contactForm = document.getElementById('contactForm');

    // Se não existir, sai da função
    if (!contactForm) return;

    // Adiciona evento de submit
    contactForm.addEventListener('submit', function(e) {
        // Previne o envio padrão do formulário
        e.preventDefault();
        
        // Pega valores dos campos
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Valida se todos os campos estão preenchidos
        if (!name || !email || !subject || !message) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Simula envio (em produção seria AJAX/fetch)
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');

        // Limpa o formulário
        contactForm.reset();
    });
}

