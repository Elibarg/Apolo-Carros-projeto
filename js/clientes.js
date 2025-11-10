// Arquivo: js/clientes.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é admin
    if (!AuthService.isAdmin()) {
        alert('Acesso restrito a administradores.');
        window.location.href = '../../html/login.html';
        return;
    }

    carregarUsuarios();
    configurarBusca();
    configurarPaginacao();
});

async function carregarUsuarios(pagina = 1) {
    try {
        mostrarLoading(true);
        
        const token = localStorage.getItem('user_token');
        const response = await fetch(`../../backend/api/users.php?page=${pagina}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            preencherTabela(result.data.users);
            atualizarPaginacao(result.data.pagination);
        } else {
            mostrarNotificacao('Erro ao carregar usuários.', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarNotificacao('Erro de conexão.', 'error');
    } finally {
        mostrarLoading(false);
    }
}

function preencherTabela(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Nenhum usuário encontrado.
                </td>
            </tr>
        `;
        return;
    }

    const userData = AuthService.getUserData();

    users.forEach(user => {
        const podeExcluir = user.id != userData.id; // ✅ Não pode excluir a si mesmo
        
        const row = `
            <tr>
                <td>${user.nome_completo}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.tipo_usuario === 'admin' ? 'admin' : 'user'}">
                        ${user.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                </td>
                <td>${formatarTelefone(user.telefone)}</td>
                <td>${formatarData(user.data_cadastro)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-outline" onclick="editarUsuario(${user.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ${!podeExcluir ? 'disabled' : ''}" 
                            onclick="${podeExcluir ? `excluirUsuario(${user.id})` : ''}" 
                            title="${podeExcluir ? 'Excluir' : 'Não é possível excluir próprio usuário'}"
                            ${!podeExcluir ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function formatarTelefone(telefone) {
    if (!telefone) return 'N/A';
    
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
}

function formatarData(dataString) {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

function configurarBusca() {
    const searchInput = document.getElementById('searchInput');
    let timeoutId;

    searchInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            buscarUsuarios(this.value);
        }, 500);
    });
}

async function buscarUsuarios(termo) {
    try {
        mostrarLoading(true);
        
        const token = localStorage.getItem('user_token');
        const response = await fetch(`../../backend/api/users.php?page=1&limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const usuariosFiltrados = result.data.users.filter(usuario => 
                usuario.nome_completo.toLowerCase().includes(termo.toLowerCase()) ||
                usuario.email.toLowerCase().includes(termo.toLowerCase()) ||
                (usuario.telefone && usuario.telefone.includes(termo))
            );
            
            preencherTabela(usuariosFiltrados);
            document.querySelector('.pagination').style.display = 'none';
        }
    } catch (error) {
        console.error('Erro na busca:', error);
        mostrarNotificacao('Erro na busca.', 'error');
    } finally {
        mostrarLoading(false);
    }
}

function configurarPaginacao() {
    // A paginação será atualizada dinamicamente pelos dados da API
}

function atualizarPaginacao(paginacao) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const { current_page, total_pages } = paginacao;

    // Botão anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.className = `btn btn-outline ${current_page === 1 ? 'disabled' : ''}`;
    btnAnterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
    btnAnterior.onclick = () => current_page > 1 && carregarUsuarios(current_page - 1);
    paginationContainer.appendChild(btnAnterior);

    // Páginas
    for (let i = 1; i <= total_pages; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = `btn btn-outline ${i === current_page ? 'active' : ''}`;
        btnPagina.textContent = i;
        btnPagina.onclick = () => carregarUsuarios(i);
        paginationContainer.appendChild(btnPagina);
    }

    // Botão próximo
    const btnProximo = document.createElement('button');
    btnProximo.className = `btn btn-outline ${current_page === total_pages ? 'disabled' : ''}`;
    btnProximo.innerHTML = '<i class="fas fa-chevron-right"></i>';
    btnProximo.onclick = () => current_page < total_pages && carregarUsuarios(current_page + 1);
    paginationContainer.appendChild(btnProximo);
}

function editarUsuario(id) {
    window.location.href = `editar_cliente.html?id=${id}`;
}

// ✅ FUNÇÃO EXCLUIR USUÁRIO CORRIGIDA
async function excluirUsuario(id) {
    // ✅ IMPEDIR EXCLUSÃO DO PRÓPRIO USUÁRIO
    const userData = AuthService.getUserData();
    if (id == userData.id) {
        mostrarNotificacao('Você não pode excluir sua própria conta.', 'error');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?\nEsta ação não pode ser desfeita.')) {
        return;
    }

    try {
        mostrarLoading(true);
        
        const token = localStorage.getItem('user_token');
        const response = await fetch(`../../backend/api/users.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarNotificacao('Usuário excluído com sucesso!', 'success');
            // ✅ RECARREGAR A LISTA APÓS EXCLUSÃO
            setTimeout(() => {
                carregarUsuarios();
            }, 1000);
        } else {
            mostrarNotificacao('Erro: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        mostrarNotificacao('Erro ao excluir usuário. Tente novamente.', 'error');
    } finally {
        mostrarLoading(false);
    }
}

function mostrarLoading(mostrar) {
    let loading = document.getElementById('loadingOverlay');
    
    if (!loading && mostrar) {
        loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando...</p>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        `;
        
        document.body.appendChild(loading);
    } else if (loading && !mostrar) {
        loading.remove();
    }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacaoAnterior = document.querySelector('.notification');
    if (notificacaoAnterior) {
        notificacaoAnterior.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <span>${mensagem}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 500px;
        animation: slideIn 0.3s ease;
    `;

    const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.backgroundColor = cores[tipo] || cores.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Adicionar CSS para animação
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            margin-left: 10px;
        }
        
        .text-center {
            text-align: center;
        }
        
        .loading-spinner {
            text-align: center;
        }
        
        .loading-spinner i {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        .actions .btn.disabled {
            background-color: #6c757d;
            border-color: #6c757d;
        }
    `;
    document.head.appendChild(style);
}