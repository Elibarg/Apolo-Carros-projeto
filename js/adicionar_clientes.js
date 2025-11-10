// Arquivo: js/adicionar_clientes.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addUserForm');
    
    // Aplicar máscaras
    aplicarMascaras();
    
    // Buscar CEP automático
    configurarBuscaCEP();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            await cadastrarUsuario();
        }
    });
});

function aplicarMascaras() {
    // Máscara de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2')
                           .replace(/(\d{3})(\d)/, '$1.$2')
                           .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    // Máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length === 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2')
                           .replace(/(\d{5})(\d)/, '$1-$2');
            } else if (value.length === 10) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2')
                           .replace(/(\d{4})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    // Máscara de CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);
            
            if (value.length === 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    // Máscara de estado (sempre maiúsculo)
    const estadoInput = document.getElementById('estado');
    if (estadoInput) {
        estadoInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    }
}

function configurarBuscaCEP() {
    const cepInput = document.getElementById('cep');
    
    if (cepInput) {
        cepInput.addEventListener('blur', async function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        document.getElementById('endereco').value = data.logradouro || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('estado').value = data.uf || '';
                    } else {
                        mostrarNotificacao('CEP não encontrado.', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                    mostrarNotificacao('Erro ao buscar CEP.', 'error');
                }
            }
        });
    }
}

function validarFormulario() {
    const requiredFields = [
        'nome_completo', 'email', 'cpf', 'telefone', 'senha'
    ];

    for (const fieldName of requiredFields) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            mostrarNotificacao(`O campo ${field.previousElementSibling.textContent} é obrigatório.`, 'error');
            field.focus();
            return false;
        }
    }

    // Validar email
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarNotificacao('Por favor, insira um email válido.', 'error');
        return false;
    }

    // Validar CPF
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    if (cpf.length !== 11) {
        mostrarNotificacao('CPF deve ter 11 dígitos.', 'error');
        return false;
    }

    // Validar senha
    const senha = document.getElementById('senha').value;
    if (senha.length < 6) {
        mostrarNotificacao('A senha deve ter pelo menos 6 caracteres.', 'error');
        return false;
    }

    return true;
}

async function cadastrarUsuario() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    const userData = {
        nome_completo: formData.get('nome_completo'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        tipo_usuario: formData.get('tipo_usuario'),
        cpf: formData.get('cpf').replace(/\D/g, ''),
        telefone: formData.get('telefone').replace(/\D/g, ''),
        data_nascimento: formData.get('data_nascimento') || null,
        genero: formData.get('genero') || null,
        cep: formData.get('cep').replace(/\D/g, '') || null,
        endereco: formData.get('endereco') || null,
        bairro: formData.get('bairro') || null,
        cidade: formData.get('cidade') || null,
        estado: formData.get('estado') || null
    };

    try {
        const token = localStorage.getItem('user_token');
        const response = await fetch('../../backend/api/users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.success) {
            mostrarNotificacao('Usuário cadastrado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'clientes.html';
            }, 1500);
        } else {
            mostrarNotificacao(result.message || 'Erro ao cadastrar usuário.', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro de conexão.', 'error');
    }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação anterior se existir
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

    // Estilos da notificação
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

    // Cores baseadas no tipo
    const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.backgroundColor = cores[tipo] || cores.info;

    document.body.appendChild(notification);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// CSS para animação
const style = document.createElement('style');
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
`;
document.head.appendChild(style);