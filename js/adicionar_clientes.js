const API_URL = "../../backend/api/users.php";

document.getElementById("addUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const payload = {};
    form.forEach((v, k) => payload[k] = v);

    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
        alert("Usuário cadastrado com sucesso!");
        window.location.href = "clientes.html";
    } else {
        alert("Erro: " + data.message);
    }
});
