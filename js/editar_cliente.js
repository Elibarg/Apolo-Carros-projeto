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
// CARREGAR DADOS DO USUÁRIO
// ===============================
fetch(`${API_URL}?id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) return;

        const u = data.data;

        document.getElementById("nome").value = u.nome_completo;
        document.getElementById("cpf").value = u.cpf;
        document.getElementById("email").value = u.email;
        document.getElementById("telefone").value = u.telefone;
        document.getElementById("tipo").value = u.tipo_usuario;
        document.getElementById("data_nascimento").value = u.data_nascimento ?? "";
        document.getElementById("genero").value = u.genero ?? "";

        document.getElementById("cep").value = u.cep ?? "";
        document.getElementById("endereco").value = u.endereco ?? "";
        document.getElementById("bairro").value = u.bairro ?? "";
        document.getElementById("cidade").value = u.cidade ?? "";
        document.getElementById("estado").value = u.estado ?? "";
    })
    .catch(err => console.error("Erro ao carregar usuário:", err));

// ===============================
// SALVAR ALTERAÇÕES
// ===============================
document.getElementById("editUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const payload = {};

    form.forEach((v, k) => payload[k] = v);
    payload["id"] = userId;

    const res = await fetch(`${API_URL}?id=${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
        alert("Usuário atualizado!");
        window.location.href = "clientes.html";
    } else {
        alert("Erro: " + data.message);
    }
});
