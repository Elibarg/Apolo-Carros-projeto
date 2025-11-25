// ===============================
// CONFIGURAÇÕES
// ===============================
const API_URL = "../../backend/api/vehicles.php";

// PEGAR ID DA URL
const urlParams = new URLSearchParams(window.location.search);
const vehicleId = urlParams.get("id");

if (!vehicleId) {
    alert("ID inválido.");
    window.history.back();
}

// VARIÁVEIS GLOBAIS
let existingImages = [];  // Imagens já salvas no servidor
let removedImages = [];   // Imagens que o usuário quer excluir
let newImages = [];       // Novas imagens selecionadas

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
        existingImages = v.images || [];
        loadExistingImages(existingImages);
        updateImageStats();
    })
    .catch(err => {
        console.error("Erro ao carregar veículo:", err);
        alert("Erro ao carregar dados do veículo.");
    });

// ===============================
// TOGGLE DATA DE COMPRA
// ===============================
function togglePurchaseDate(status) {
    const purchaseDateGroup = document.getElementById("purchaseDateGroup");
    purchaseDateGroup.style.display = (status === 'sold') ? 'block' : 'none';
}

// Event listener para mudança de status
document.getElementById("status").addEventListener("change", function() {
    togglePurchaseDate(this.value);
});

// ===============================
// GERENCIAMENTO DE IMAGENS EXISTENTES
// ===============================
function loadExistingImages(images) {
    const imageGrid = document.getElementById("imageGrid");
    const uploadBtn = imageGrid.querySelector('.upload-new');
    imageGrid.innerHTML = '';
    imageGrid.appendChild(uploadBtn);

    images.forEach((imgUrl, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview';
        imgContainer.innerHTML = `
            <img src="..${imgUrl}" alt="Imagem veículo ${index + 1}" onerror="this.src='../../img/placeholder-car.jpg'">
            <button type="button" class="remove-image" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        imageGrid.insertBefore(imgContainer, uploadBtn);
    });

    document.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removedImages.push(existingImages[index]);
            existingImages.splice(index, 1);
            loadExistingImages(existingImages);
            updateImageStats();
        });
    });
}

// ===============================
// SELEÇÃO E PREVIEW DE NOVAS IMAGENS
// ===============================
function previewNewImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageGrid = document.getElementById("imageGrid");
        const uploadBtn = imageGrid.querySelector('.upload-new');
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview new-image';

        imgContainer.innerHTML = `
            <img src="${e.target.result}" alt="Nova imagem">
            <button type="button" class="remove-new-image">
                <i class="fas fa-times"></i>
            </button>
        `;

        imageGrid.insertBefore(imgContainer, uploadBtn);

        imgContainer.querySelector('.remove-new-image').addEventListener('click', function() {
            const index = newImages.indexOf(file);
            if (index > -1) newImages.splice(index, 1);
            imgContainer.remove();
            updateImageStats();
        });
    };
    reader.readAsDataURL(file);
}

// ===============================
// CAPTURA DE ARQUIVOS
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('imageInput');
    const uploadArea = document.querySelector('.upload-new');

    // Clique -> Abre seletor
    uploadArea.addEventListener('click', () => fileInput.click());

    // Mudança no input file
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return alert('Selecione apenas imagens.');
            newImages.push(file);
            previewNewImage(file);
        });

        e.target.value = ''; // Permite selecionar de novo
        updateImageStats();
    });

    setupDragAndDrop();
});

// ===============================
// DRAG AND DROP
// ===============================
function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-new');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    uploadArea.addEventListener('drop', e => {
        const files = Array.from(e.dataTransfer.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return alert('Selecione apenas imagens.');
            newImages.push(file);
            previewNewImage(file);
        });

        updateImageStats();
    });
}

// ===============================
// ATUALIZAR ESTATÍSTICAS
// ===============================
function updateImageStats() {
    const existingEl = document.getElementById('existingCount');
    const newEl = document.getElementById('newCount');
    const removedEl = document.getElementById('removedCount');

    if (existingEl) existingEl.textContent = existingImages.length;
    if (newEl) newEl.textContent = newImages.length;
    if (removedEl) removedEl.textContent = removedImages.length;
}


// ===============================
// SALVAR ALTERAÇÕES
// ===============================
document.getElementById("editVehicleForm").addEventListener("submit", async (e) => {
    e.preventDefault();


    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    submitBtn.disabled = true;

    try {
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

        if (document.getElementById("status").value === "sold") {
            formData.append("data_compra", document.getElementById("data_compra").value);
        }

        removedImages.forEach(img => formData.append("removed_images[]", img));
        newImages.forEach(file => formData.append("images[]", file));

        const res = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            alert("Veículo atualizado com sucesso!");
            window.location.href = "estoque.html";
        } else {
            throw new Error(data.message || "Erro ao atualizar veículo");
        }
    } catch (error) {
        alert("Erro ao atualizar veículo: " + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});
