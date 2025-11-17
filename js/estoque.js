const VEH_API = "../../backend/api/vehicles.php";

document.addEventListener("DOMContentLoaded", () => {
    loadVehicles(1);
});

// Carregar veículos
function loadVehicles(page = 1) {
    fetch(`${VEH_API}?page=${page}&limit=10`, {credentials: 'include'})
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                console.error("Erro API veículos:", res);
                return;
            }
            renderVehicles(res.data.vehicles);
            renderPagination(res.data.pagination);
        })
        .catch(err => console.error("Erro ao carregar veículos:", err));
}

function renderVehicles(list){
    const tbody = document.querySelector(".data-table tbody");
    tbody.innerHTML = "";
    list.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${v.marca} ${v.modelo}</td>
            <td>${v.ano}</td>
            <td>${v.km?.toLocaleString?.() ?? v.km}</td>
            <td><span class="badge ${v.status === 'available' ? 'success' : v.status === 'reserved' ? 'warning' : ''}">${v.status === 'available' ? 'Disponível' : v.status === 'reserved' ? 'Reservado' : 'Vendido'}</span></td>
            <td class="actions">
                <a href="editar_estoque.html?id=${v.id}" class="btn btn-sm btn-outline"><i class="fas fa-edit"></i></a>
                <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${v.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination(p) {
    const container = document.querySelector(".pagination");
    if (!container) return;
    container.innerHTML = "";
    const left = document.createElement("button");
    left.className = "btn btn-outline";
    left.disabled = p.current_page <= 1;
    left.innerHTML = `<i class="fas fa-chevron-left"></i>`;
    left.addEventListener("click", () => loadVehicles(Math.max(1, p.current_page -1)));
    container.appendChild(left);

    for (let i=1;i<=p.total_pages;i++){
        const btn = document.createElement("button");
        btn.className = `btn btn-outline ${i===p.current_page? 'active':''}`;
        btn.innerText = i;
        btn.addEventListener("click", ()=> loadVehicles(i));
        container.appendChild(btn);
    }

    const right = document.createElement("button");
    right.className = "btn btn-outline";
    right.disabled = p.current_page >= p.total_pages;
    right.innerHTML = `<i class="fas fa-chevron-right"></i>`;
    right.addEventListener("click", () => loadVehicles(Math.min(p.total_pages, p.current_page+1)));
    container.appendChild(right);
}

function deleteVehicle(id){
    if (!confirm("Excluir veículo permanentemente?")) return;
    fetch(`${VEH_API}?id=${id}`, { method: "DELETE", credentials: 'include' })
        .then(r => r.json())
        .then(res => {
            alert(res.message);
            loadVehicles(1);
        })
        .catch(err => console.error(err));
}
