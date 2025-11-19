const API_URL = "../../backend/api/vehicles.php";

// ===============================
// PEGAR ID DA URL
// ===============================
const urlParams = new URLSearchParams(window.location.search);
const vehicleId = urlParams.get("id");

if (!vehicleId) {
    alert("ID inválido.");
    window.history.back();
}

// ===============================
// CARREGAR DADOS DO VEÍCULO
// ===============================
fetch(`${API_URL}?id=${vehicleId}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert("Erro ao carregar veículo.");
            return;
        }

        const v = data.data;

        document.getElementById("vehicleId").value = v.id;
        document.getElementById("marca").value = v.marca;
        document.getElementById("modelo").value = v.modelo;
        document.getElementById("ano").value = v.ano;
        document.getElementById("km").value = v.km;
        document.getElementById("preco").value = v.preco;
        document.getElementById("status").value = v.status;
        document.getElementById("destaque").value = v.destaque || "nao";
        document.getElementById("descricao").value = v.descricao || "";

        // Preencher data de compra se existir
        if (v.data_compra) {
            document.getElementById("data_compra").value = v.data_compra;
        }

        // Mostrar/ocultar data de compra baseado no status
        togglePurchaseDate(v.status);

        // Carregar imagens existentes
        loadExistingImages(v.images || []);
    })
    .catch(err => console.error("Erro ao carregar veículo:", err));

// ===============================
// TOGGLE DATA DE COMPRA
// ===============================
function togglePurchaseDate(status) {
    const purchaseDateGroup = document.getElementById("purchaseDateGroup");
    if (status === 'sold') {
        purchaseDateGroup.style.display = 'block';
    } else {
        purchaseDateGroup.style.display = 'none';
    }
}

// Event listener para mudança de status
document.getElementById("status").addEventListener("change", function() {
    togglePurchaseDate(this.value);
});

// ===============================
// GERENCIAMENTO DE IMAGENS
// ===============================
let existingImages = [];
let removedImages = [];

function loadExistingImages(images) {
    existingImages = images;
    const imageGrid = document.getElementById("imageGrid");
    
    // Limpar grid (exceto o botão de upload)
    const uploadBtn = imageGrid.querySelector('.upload-new');
    imageGrid.innerHTML = '';
    imageGrid.appendChild(uploadBtn);

    // Adicionar imagens existentes
    images.forEach((imgUrl, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview';
        imgContainer.innerHTML = `
            <img src="${imgUrl}" alt="Veículo ${index + 1}">
            <button type="button" class="remove-image" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        imageGrid.insertBefore(imgContainer, uploadBtn);
    });

    // Adicionar event listeners para botões de remover
    document.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removedImages.push(existingImages[index]);
            existingImages.splice(index, 1);
            loadExistingImages(existingImages);
        });
    });
}

// Upload de novas imagens
document.getElementById('imageInput').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        // Aqui você pode implementar o preview das novas imagens
        // Por enquanto, apenas limpa o input
        this.value = '';
    }
});

// ===============================
// SALVAR ALTERAÇÕES
// ===============================
document.getElementById("editVehicleForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("id", vehicleId);
    formData.append("marca", document.getElementById("marca").value);
    formData.append("modelo", document.getElementById("modelo").value);
    formData.append("ano", document.getElementById("ano").value);
    formData.append("km", document.getElementById("km").value);
    formData.append("preco", document.getElementById("preco").value);
    formData.append("status", document.getElementById("status").value);
    formData.append("destaque", document.getElementById("destaque").value);
    formData.append("descricao", document.getElementById("descricao").value);

    // Adicionar data de compra apenas se status for 'sold'
    if (document.getElementById("status").value === 'sold') {
        formData.append("data_compra", document.getElementById("data_compra").value);
    }

    // Adicionar imagens removidas
    removedImages.forEach(img => {
        formData.append("removed_images[]", img);
    });

    // Adicionar novas imagens
    const imageInput = document.getElementById('imageInput');
    if (imageInput.files.length > 0) {
        for (let i = 0; i < imageInput.files.length; i++) {
            formData.append("images[]", imageInput.files[i]);
        }
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            alert("Veículo atualizado com sucesso!");
            window.location.href = "estoque.html";
        } else {
            alert("Erro: " + data.message);
        }
    } catch (err) {
        console.error("Erro ao atualizar veículo:", err);
        alert("Erro ao atualizar veículo.");
    }
});