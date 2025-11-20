// ====================================
//  CONFIGURAÇÃO INICIAL
// ====================================
const API_URL = "../../backend/api/users.php";

// ====================================
//  ESTILOS DINÂMICOS
// ====================================
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .dynamic-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .dynamic-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .dynamic-table th {
            padding: 1rem 1.25rem;
            text-align: left;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }
        
        .dynamic-table td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.3s ease;
        }
        
        .dynamic-table tbody tr:hover {
            background-color: #f8f9ff;
            transform: translateY(-1px);
        }
        
        .dynamic-badge {
            display: inline-block;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-admin {
            background: rgba(241, 196, 15, 0.15);
            color: #f39c12;
            border: 1px solid rgba(241, 196, 15, 0.3);
        }
        
        .badge-user {
            background: rgba(39, 174, 96, 0.15);
            color: #27ae60;
            border: 1px solid rgba(39, 174, 96, 0.3);
        }
        
        .dynamic-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
        }
        
        .btn-edit {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #2196f3;
            color: white;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-edit:hover {
            background: #1976d2;
            transform: translateY(-2px);
        }
        
        .btn-delete {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-delete:hover {
            background: #d32f2f;
            transform: translateY(-2px);
        }
        
        .dynamic-pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 2rem;
            padding: 1rem;
        }
        
        .dynamic-pagination button {
            padding: 0.75rem 1rem;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 44px;
        }
        
        .dynamic-pagination button:hover:not(:disabled) {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .dynamic-pagination button.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .dynamic-pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}

// ====================================
//  FUNÇÃO PRINCIPAL AO CARREGAR
// ====================================
document.addEventListener("DOMContentLoaded", () => {
    addDynamicStyles();
    loadUsers(1); // AGORA EXISTE
});

// ====================================
//  BUSCAR USUÁRIOS NA API
// ====================================
function loadUsers(page = 1) {
    console.log(`[DEBUG] Chamando loadUsers(${page})`);

    fetch(`${API_URL}?page=${page}&limit=10`)
        .then(res => res.json())
        .then(data => {
            console.log("API data:", data);

            if (!data.success || !data.data) {
                console.warn("Nenhum usuário encontrado ou erro na API");
                return;
            }

            renderUsers(data.data.users);
            renderPagination(data.data.pagination);
        })
        .catch(err => console.error("Erro ao carregar usuários:", err));
}

// ====================================
//  FORMATAR DATA
// ====================================
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return (
        date.toLocaleDateString("pt-BR") +
        " " +
        date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
    );
}

// ====================================
//  RENDERIZAR TABELA DE USUÁRIOS
// ====================================
function renderUsers(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${user.nome_completo}</td>
            <td>${user.email}</td>
            <td>
                <span class="dynamic-badge ${user.tipo_usuario === 'admin' ? 'badge-admin' : 'badge-user'}">
                    ${user.tipo_usuario}
                </span>
            </td>
            <td>${user.telefone ?? "-"}</td>
            <td>${formatDate(user.data_cadastro)}</td>
            <td>
                <div class="dynamic-actions">
                    <a href="editar_cliente.html?id=${user.id}" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button onclick="deleteUser(${user.id})" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ====================================
//  PAGINAÇÃO
// ====================================
function renderPagination(p) {
    const container = document.getElementById("paginationContainer");
    if (!container) return;

    container.innerHTML = "";
    container.className = "dynamic-pagination";

    // Botão de página anterior
    const prevButton = document.createElement("button");
    prevButton.innerHTML = `<i class="fas fa-chevron-left"></i>`;
    prevButton.disabled = p.current_page <= 1;
    prevButton.addEventListener("click", () => loadUsers(p.current_page - 1));
    container.appendChild(prevButton);

    // Páginas
    for (let i = 1; i <= p.total_pages; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        if (i === p.current_page) button.classList.add('active');
        button.addEventListener("click", () => loadUsers(i));
        container.appendChild(button);
    }

    // Botão de próxima página
    const nextButton = document.createElement("button");
    nextButton.innerHTML = `<i class="fas fa-chevron-right"></i>`;
    nextButton.disabled = p.current_page >= p.total_pages;
    nextButton.addEventListener("click", () => loadUsers(p.current_page + 1));
    container.appendChild(nextButton);
}

// ====================================
//  DELETAR USUÁRIO
// ====================================
function deleteUser(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    fetch(`${API_URL}?id=${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadUsers(1);
        })
        .catch(err => console.error("Erro ao excluir usuário:", err));
}

// ====================================
//  BUSCA LOCAL (FILTRAR LISTA)
// ====================================
document.getElementById("searchButton").addEventListener("click", applySearch);
document.getElementById("searchInput").addEventListener("keyup", applySearch);

function applySearch() {
    const query = document.getElementById("searchInput").value.toLowerCase();

    document.querySelectorAll("#usersTableBody tr").forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}
