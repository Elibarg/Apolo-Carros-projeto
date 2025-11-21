const API_URL = "../../backend/api/users.php";

// ===============================
// PEGAR ID DA URL
// ===============================
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

if (!userId) {
    alert("ID inválido.");
    window.history.back();
}

// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let passwordsVisible = false;

// ===============================
// CARREGAR DADOS DO USUÁRIO
// ===============================
async function loadUserData() {
    try {
        showLoading();
        
        console.log(`🔍 Buscando usuário ID: ${userId}`);
        
        const response = await fetch(`${API_URL}?id=${userId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuário não encontrado. O ID pode estar incorreto ou o usuário foi excluído.');
            } else if (response.status === 401) {
                throw new Error('Não autorizado. Faça login novamente.');
            } else if (response.status === 403) {
                throw new Error('Acesso negado. Você não tem permissão para editar usuários.');
            } else {
                throw new Error(`Erro do servidor: ${response.status}`);
            }
        }
        
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar dados do usuário');
        }

        const u = data.data;
        console.log('✅ Dados do usuário carregados:', u);

        // Preencher formulário
        document.getElementById("nome").value = u.nome_completo || '';
        document.getElementById("cpf").value = u.cpf || '';
        document.getElementById("email").value = u.email || '';
        document.getElementById("telefone").value = u.telefone || '';
        document.getElementById("tipo").value = u.tipo_usuario || 'usuario';
        document.getElementById("data_nascimento").value = u.data_nascimento || '';
        document.getElementById("genero").value = u.genero || '';

        document.getElementById("cep").value = u.cep || '';
        document.getElementById("endereco").value = u.endereco || '';
        document.getElementById("bairro").value = u.bairro || '';
        document.getElementById("cidade").value = u.cidade || '';
        document.getElementById("estado").value = u.estado || '';

    } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        alert("Erro ao carregar dados do usuário: " + error.message);
        
        setTimeout(() => {
            window.location.href = "clientes.html";
        }, 3000);
    } finally {
        hideLoading();
    }
}

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function showLoading() {
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: #3498db;"></i>
                <p style="margin-top: 10px;">Carregando...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ===============================
// EVENT LISTENERS PARA SENHA
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    document.getElementById('generatePassword').addEventListener('click', generateRandomPassword);
    document.getElementById('nova_senha').addEventListener('input', checkPasswordStrength);
    document.getElementById('confirmar_senha').addEventListener('input', checkPasswordMatch);
});

// ===============================
// FUNÇÕES DE MANIPULAÇÃO DE SENHA
// ===============================
function togglePasswordVisibility() {
    const passwordFields = [
        document.getElementById('nova_senha'),
        document.getElementById('confirmar_senha')
    ];
    
    passwordsVisible = !passwordsVisible;
    
    passwordFields.forEach(field => {
        if (field) {
            field.type = passwordsVisible ? 'text' : 'password';
        }
    });
    
    const toggleBtn = document.getElementById('togglePassword');
    const icon = toggleBtn.querySelector('i');
    
    if (passwordsVisible) {
        icon.className = 'fas fa-eye-slash';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Senhas';
    } else {
        icon.className = 'fas fa-eye';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Mostrar Senhas';
    }
}

function generateRandomPassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    document.getElementById('nova_senha').value = password;
    document.getElementById('confirmar_senha').value = password;
    
    checkPasswordStrength();
    checkPasswordMatch();
    
    const wasVisible = passwordsVisible;
    if (!wasVisible) {
        togglePasswordVisibility();
        setTimeout(() => {
            if (!wasVisible) togglePasswordVisibility();
        }, 3000);
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('nova_senha').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '#e0e0e0';
        strengthText.textContent = '';
        return;
    }
    
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    strength = Math.min(strength, 100);
    
    strengthBar.style.width = strength + '%';
    
    if (strength < 50) {
        strengthBar.style.backgroundColor = '#e74c3c';
        feedback = 'Fraca';
    } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#f39c12';
        feedback = 'Média';
    } else {
        strengthBar.style.backgroundColor = '#27ae60';
        feedback = 'Forte';
    }
    
    strengthText.textContent = feedback;
}

function checkPasswordMatch() {
    const password = document.getElementById('nova_senha').value;
    const confirmPassword = document.getElementById('confirmar_senha').value;
    const matchElement = document.querySelector('.password-match');
    
    if (!password || !confirmPassword) {
        matchElement.style.display = 'none';
        return;
    }
    
    if (password === confirmPassword) {
        matchElement.style.display = 'flex';
        matchElement.style.color = '#27ae60';
        matchElement.querySelector('i').className = 'fas fa-check';
        matchElement.querySelector('span').textContent = 'Senhas coincidem';
    } else {
        matchElement.style.display = 'flex';
        matchElement.style.color = '#e74c3c';
        matchElement.querySelector('i').className = 'fas fa-times';
        matchElement.querySelector('span').textContent = 'Senhas não coincidem';
    }
}

// ===============================
// VALIDAÇÃO DO FORMULÁRIO
// ===============================
function validateForm(payload) {
    const novaSenha = payload.nova_senha;
    const confirmarSenha = payload.confirmar_senha;
    
    if (novaSenha && !confirmarSenha) {
        alert('Por favor, confirme a nova senha.');
        return false;
    }
    
    if (!novaSenha && confirmarSenha) {
        alert('Por favor, digite a nova senha.');
        return false;
    }
    
    if (novaSenha && confirmarSenha && novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem. Por favor, verifique.');
        return false;
    }
    
    if (novaSenha && novaSenha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return false;
    }
    
    return true;
}

// ===============================
// SALVAR ALTERAÇÕES
// ===============================
document.getElementById("editUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        showLoading();

        const form = new FormData(e.target);
        const payload = {};

        form.forEach((v, k) => {
            if (v !== '' || k === 'nova_senha') {
                payload[k] = v;
            }
        });
        
        payload["id"] = userId;

        if (!validateForm(payload)) {
            hideLoading();
            return;
        }

        if (payload.nova_senha) {
            payload.senha = payload.nova_senha;
            delete payload.nova_senha;
        }
        
        delete payload.confirmar_senha;

        console.log('📤 Enviando dados para atualização:', payload);

        const res = await fetch(`${API_URL}?id=${userId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Usuário não encontrado. Talvez tenha sido excluído.');
            }
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
            alert("Usuário atualizado com sucesso!");
            window.location.href = "clientes.html";
        } else {
            throw new Error(data.message || 'Erro ao atualizar usuário');
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário: ' + error.message);
    } finally {
        hideLoading();
    }
});