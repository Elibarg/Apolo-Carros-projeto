// =============================================
// FUNÇÕES GERAIS (válidas para todas as páginas do admin)
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Ativa o dropdown do usuário no topo (presente em todas as páginas)
    setupUserDropdown();
    
    // Obtém o caminho da URL para identificar a página atual
    const path = window.location.pathname;

    // Executa funções específicas para cada página
    if (path.includes('estoque/index.html')) {
        setupEstoqueListagem(); // Configura a página de listagem de veículos
    } else if (path.includes('estoque/editar.html')) {
        setupEstoqueEdicao(); // Configura a página de edição de veículos
    } else if (path.includes('clientes/index.html')) {
        setupClientesListagem(); // Configura a página de listagem de clientes
    } else if (path.includes('clientes/editar.html')) {
        setupClientesEdicao(); // Configura a página de edição de clientes
    } else if (path.includes('perfil/index.html')) {
        setupProfilePage(); // Configura a página de perfil
    } else if (path.includes('estoque/adicionar.html')) {
        setupAddVehicle(); // Configura a página de adicionar veículo
    } else if (path.includes('clientes/adicionar.html')) {
        setupAddClient(); // Configura a página de adicionar cliente
    }
});

// =============================================
// Dropdown do usuário (menu suspenso no topo)
// =============================================
function setupUserDropdown() {
    // Seleciona o elemento do dropdown do usuário
    const userDropdown = document.querySelector('.user-dropdown');
    if (!userDropdown) return; // Se não existir, encerra a função

    // Adiciona evento de clique ao dropdown
    userDropdown.addEventListener('click', function(e) {
        e.stopPropagation(); // Impede a propagação do evento para elementos pais
        const menu = this.querySelector('.dropdown-menu');
        // Alterna a exibição do menu entre 'block' e 'none'
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Fecha todos os dropdowns ao clicar em qualquer lugar da página
    document.addEventListener('click', function() {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(d => d.style.display = 'none'); // Esconde todos os menus
    });
}

// =============================================
// ESTOQUE - Página de Listagem
// =============================================
function setupEstoqueListagem() {
    // Configura botões de exclusão com confirmação
    document.querySelectorAll('.btn-excluir-veiculo').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Impede o comportamento padrão do link
            if (confirm('Tem certeza que deseja excluir este veículo?')) {
                window.location.href = this.href; // Redireciona para URL de exclusão
            }
        });
    });

    // Configura filtro rápido de busca
    const searchInput = document.getElementById('search-veiculos');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase(); // Texto de busca em minúsculas
            // Filtra as linhas da tabela
            document.querySelectorAll('.veiculo-linha').forEach(linha => {
                // Mostra/oculta linhas baseado no texto buscado
                linha.style.display = linha.textContent.toLowerCase().includes(termo) ? '' : 'none';
            });
        });
    }
}

// =============================================
// ESTOQUE - Página de Edição
// =============================================
function setupEstoqueEdicao() {
    // Configura upload de imagens
    const uploadArea = document.querySelector('.upload-imagem');
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            // Cria input file dinamicamente
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*'; // Aceita apenas imagens
            fileInput.multiple = true; // Permite múltiplos arquivos

            fileInput.addEventListener('change', function(e) {
                const files = e.target.files; // Arquivos selecionados
                const previewContainer = document.querySelector('.preview-imagens');

                // Processa cada arquivo
                for (let file of files) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        // Cria preview da imagem
                        const imgPreview = document.createElement('div');
                        imgPreview.className = 'imagem-preview';
                        imgPreview.innerHTML = `
                            <img src="${event.target.result}">
                            <button class="btn-remover-imagem">&times;</button>
                        `;
                        previewContainer.appendChild(imgPreview);
                    };
                    reader.readAsDataURL(file); // Lê o arquivo como URL de dados
                }
            });

            fileInput.click(); // Dispara o clique no input file
        });

        // Configura remoção de imagens
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-remover-imagem')) {
                // Remove o preview da imagem clicada
                e.target.closest('.imagem-preview').remove();
            }
        });
    }

    // Validação do formulário de edição
    const formEdicao = document.querySelector('.form-editar-veiculo');
    if (formEdicao) {
        formEdicao.addEventListener('submit', function(e) {
            const preco = document.getElementById('preco').value;
            if (isNaN(preco) || preco <= 0) { // Verifica se o preço é válido
                e.preventDefault(); // Impede o envio do formulário
                alert('Preço inválido!');
            }
        });
    }
}

// =============================================
// CLIENTES - Página de Listagem
// =============================================
function setupClientesListagem() {
    // Aplica máscara de telefone nos inputs
    document.querySelectorAll('.input-telefone').forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value
                .replace(/\D/g, '') // Remove não-dígitos
                .replace(/(\d{2})(\d)/, '($1) $2') // Formata DDD
                .replace(/(\d{5})(\d)/, '$1-$2'); // Formata número
        });
    });

    // Configura sistema de abas
    document.querySelectorAll('.aba-clientes').forEach(aba => {
        aba.addEventListener('click', function() {
            const alvo = this.getAttribute('data-aba'); // Obtém o ID da aba alvo
            // Mostra/oculta conteúdos das abas
            document.querySelectorAll('.conteudo-aba').forEach(conteudo => {
                conteudo.style.display = conteudo.id === alvo ? 'block' : 'none';
            });
        });
    });
}

// =============================================
// CLIENTES - Página de Edição
// =============================================
function setupClientesEdicao() {
    // Máscara para CPF
    const inputCPF = document.getElementById('cpf');
    if (inputCPF) {
        inputCPF.addEventListener('input', function() {
            this.value = this.value
                .replace(/\D/g, '') // Remove não-dígitos
                .replace(/(\d{3})(\d)/, '$1.$2') // Primeiro ponto
                .replace(/(\d{3})(\d)/, '$1.$2') // Segundo ponto
                .replace(/(\d{3})(\d)/, '$1-$2'); // Hífen
        });
    }

    // Busca de endereço por CEP (ViaCEP API)
    const inputCEP = document.getElementById('cep');
    if (inputCEP) {
        inputCEP.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, ''); // Remove formatação
            if (cep.length === 8) { // Verifica se CEP está completo
                // Faz requisição à API ViaCEP
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json()) // Converte resposta para JSON
                    .then(data => {
                        if (!data.erro) { // Se encontrou o CEP
                            // Preenche os campos automaticamente
                            document.getElementById('endereco').value = data.logradouro;
                            document.getElementById('bairro').value = data.bairro;
                            document.getElementById('cidade').value = data.localidade;
                            document.getElementById('estado').value = data.uf;
                        }
                    });
            }
        });
    }
}

// =============================================
// VENDAS - Página de Dashboard
// =============================================
//.  function setupVendasDashboard() {
//.     // Efeitos de hover nas barras do gráfico
//.      document.querySelectorAll('.chart-bar').forEach(bar => {
//.          bar.addEventListener('mouseover', function() {
//.              this.style.opacity = '0.8'; // Efeito de transparência
//.          });
//.          bar.addEventListener('mouseout', function() {
//.              this.style.opacity = '1'; // Volta ao normal
//.          });
//.     });
//.  }
// =============================================
// PERFIL DO ADMIN
// =============================================

function setupProfilePage() {
    // Upload de foto de perfil
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0]; // Pega o primeiro arquivo
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Atualiza a imagem de perfil
                    document.getElementById('profileAvatar').src = event.target.result;
                };
                reader.readAsDataURL(file); // Converte para URL de dados
            }
        });
    }

    // Validação do formulário de perfil
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede envio padrão
            
            const senhaAtual = document.getElementById('senha-atual').value;
            const novaSenha = document.getElementById('nova-senha').value;
            
            // Verifica se apenas um campo de senha foi preenchido
            if ((senhaAtual || novaSenha) && !(senhaAtual && novaSenha)) {
                alert('Para alterar a senha, preencha ambos os campos!');
                return;
            }
            
            alert('Perfil atualizado com sucesso!');
        });
    }
}

// =============================================
// ADICIONAR VEÍCULO
// =============================================

function setupAddVehicle() {
    // Upload de imagens
    const imageInput = document.getElementById('vehicleImages');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const files = e.target.files; // Arquivos selecionados
            const previewContainer = document.getElementById('imagePreview');
            previewContainer.innerHTML = ''; // Limpa previews anteriores
            
            // Processa cada arquivo
            for (let file of files) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Cria elemento de preview
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'image-preview';
                    previewDiv.innerHTML = `
                        <img src="${event.target.result}">
                        <span class="remove-image">&times;</span>
                    `;
                    previewContainer.appendChild(previewDiv);
                };
                reader.readAsDataURL(file); // Lê o arquivo
            }
        });
    }

    // Configura remoção de imagens
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-image')) {
            e.target.closest('.image-preview').remove(); // Remove o preview
        }
    });

    // Máscara de preço
    const precoInput = document.getElementById('preco');
    if (precoInput) {
        precoInput.addEventListener('input', function() {
            this.value = this.value
                .replace(/\D/g, '') // Remove não-dígitos
                .replace(/(\d+)(\d{2})$/, 'R$ $1,$2') // Formata reais e centavos
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Adiciona separadores de milhar
        });
    }
}

// =============================================
// ADICIONAR CLIENTE
// =============================================

function setupAddClient() {
    // Máscara de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            this.value = this.value
                .replace(/\D/g, '')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1-$2');
        });
    }

    // Máscara de telefone
    const telInput = document.getElementById('telefone');
    if (telInput) {
        telInput.addEventListener('input', function() {
            this.value = this.value
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        });
    }

    // Busca de CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Remove formatação
        });

        // Configura botão de busca de CEP
        document.querySelector('.btn-cep')?.addEventListener('click', function() {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length === 8) { // Verifica se CEP está completo
                // Faz requisição à API ViaCEP
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.erro) { // Se encontrou o CEP
                            // Preenche os campos automaticamente
                            document.getElementById('endereco').value = data.logradouro;
                            document.getElementById('bairro').value = data.bairro;
                            document.getElementById('cidade').value = data.localidade;
                            document.getElementById('estado').value = data.uf;
                        } else {
                            alert('CEP não encontrado!');
                        }
                    });
            }
        });
    }
}

// Atualize a função principal para incluir as novas páginas
document.addEventListener('DOMContentLoaded', function() {
    // ... (código existente)
    
    if (path.includes('perfil/index.html')) {
        setupProfilePage();
    } else if (path.includes('estoque/adicionar.html')) {
        setupAddVehicle();
    } else if (path.includes('clientes/adicionar.html')) {
        setupAddClient();
    }
});
