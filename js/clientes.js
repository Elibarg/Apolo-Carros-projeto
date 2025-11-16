const API_URL = "../../backend/api/users.php";

document.addEventListener("DOMContentLoaded", () => {
    loadUsers(1);
});

// ===============================
// CARREGAR LISTA DE USUÁRIOS
// ===============================
function loadUsers(page = 1) {
    fetch(`${API_URL}?page=${page}&limit=10`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            renderUsers(data.data.users);
            renderPagination(data.data.pagination);
        })
        .catch(err => console.error("Erro ao carregar usuários:", err));
}

// ===============================
// RENDERIZAR TABELA
// ===============================
function renderUsers(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${user.nome_completo}</td>
            <td>${user.email}</td>
            <td>${user.tipo_usuario}</td>
            <td>${user.telefone ?? "-"}</td>
            <td>${formatDate(user.data_cadastro)}</td>
            <td>
                <a href="editar_cliente.html?id=${user.id}" class="btn-action edit">
                    <i class="fas fa-edit"></i>
                </a>

                <button class="class="btn-action delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// FORMATAR DATA
// ===============================
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
}

// ===============================
// PAGINAÇÃO
// ===============================
function renderPagination(p) {
    const container = document.getElementById("paginationContainer");
    container.innerHTML = "";

    for (let i = 1; i <= p.total_pages; i++) {
        const button = document.createElement("button");
        button.innerText = i;

        if (i === p.current_page) button.classList.add("active");

        button.addEventListener("click", () => loadUsers(i));

        container.appendChild(button);
    }
}

// ===============================
// DELETAR USUÁRIO
// ===============================
function deleteUser(id) {
    if (!confirm("Tem certeza que deseja excluir o usuário?")) return;

    fetch(`${API_URL}?id=${id}`, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadUsers(1);
        })
        .catch(err => console.error("Erro ao excluir usuário:", err));
}

// ===============================
// BUSCA (CLIENT-SIDE) NO NOME/EMAIL/TELEFONE/TIPO
// ===============================
document.getElementById("searchButton").addEventListener("click", applySearch);
document.getElementById("searchInput").addEventListener("keyup", applySearch);

function applySearch() {
    const query = document.getElementById("searchInput").value.toLowerCase();

    document.querySelectorAll("#usersTableBody tr").forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}
