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
let existingImages = [];
let removedImages = [];
let newImages = [];

// ===============================
// TRATAMENTO DE RESPOSTA DA API
// ===============================
async function handleApiResponse(response) {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não-JSON:', text.substring(0, 200));
        
        if (response.status === 401) {
            throw new Error('Não autorizado');
        }
        
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

// ===============================
// CARREGAR DADOS DO VEÍCULO (CORRIGIDO)
// ===============================
function loadVehicleData() {
    console.log('Carregando veículo ID:', vehicleId);

    fetch(`${API_URL}?id=${vehicleId}`, {
        method: 'GET',
        credentials: 'include', // Envia cookies de sessão
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error('Não autorizado');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return handleApiResponse(response);
    })
    .then(result => {
        if (!result.success) {
            throw new Error(result.message || 'Erro ao carregar veículo');
        }

        const vehicle = result.data;
        
        if (!vehicle) {
            throw new Error('Veículo não encontrado');
        }

        console.log("Veículo carregado com sucesso:", vehicle);

        fillForm(vehicle);

        existingImages = Array.isArray(vehicle.images) ? vehicle.images : [];
        loadExistingImages(existingImages);
        updateImageStats();
    })
    .catch(error => {
        console.error("Erro ao carregar veículo:", error);
        
        if (error.message.includes('Não autorizado')) {
            alert("Acesso restrito a administradores. Faça login como administrador.");
            window.location.href = '../../html/login.html';
        } else {
            alert("Erro ao carregar veículo: " + error.message);
            window.history.back();
        }
    });
}

// ===============================
// PREENCHER FORMULÁRIO
// ===============================
function fillForm(vehicle) {
    const fields = {
        'vehicleId': vehicle.id,
        'marca': vehicle.marca || '',
        'modelo': vehicle.modelo || '',
        'ano': vehicle.ano || '',
        'km': vehicle.km || 0,
        'preco': vehicle.preco || 0,
        'status': vehicle.status || 'available',
        'destaque': vehicle.destaque || 'nao',
        'categoria': vehicle.categoria || '',
        'combustivel': vehicle.combustivel || '',
        'cambio': vehicle.cambio || '',
        'descricao': vehicle.descricao || '',
        'data_compra': vehicle.data_compra || ''
    };

    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = fields[fieldId];
        }
    });

    togglePurchaseDate(vehicle.status);
}

// ===============================
// TOGGLE DATA DE COMPRA
// ===============================
function togglePurchaseDate(status) {
    const purchaseDateGroup = document.getElementById("purchaseDateGroup");
    if (purchaseDateGroup) {
        purchaseDateGroup.style.display = (status === 'sold') ? 'block' : 'none';
    }
}

// ===============================
// GERENCIAMENTO DE IMAGENS EXISTENTES
// ===============================
function loadExistingImages(images) {
    const imageGrid = document.getElementById("imageGrid");
    if (!imageGrid) return;
    
    const uploadBtn = imageGrid.querySelector('.upload-new');
    imageGrid.innerHTML = '';
    
    if (uploadBtn) {
        imageGrid.appendChild(uploadBtn);
    }

    images.forEach((imgUrl, index) => {
        if (!imgUrl) return;
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview';
        
        let imageSrc = imgUrl;
        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
            imageSrc = '/' + imgUrl;
        }
        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
            imageSrc = '../../' + imageSrc;
        }
        
        imgContainer.innerHTML = `
            <img src="${imageSrc}" alt="Imagem veículo ${index + 1}" onerror="this.src='../../img/placeholder-car.jpg'">
            <button type="button" class="remove-image" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        if (uploadBtn) {
            imageGrid.insertBefore(imgContainer, uploadBtn);
        } else {
            imageGrid.appendChild(imgContainer);
        }
    });

    document.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (index >= 0 && index < existingImages.length) {
                removedImages.push(existingImages[index]);
                existingImages.splice(index, 1);
                loadExistingImages(existingImages);
                updateImageStats();
            }
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
        if (!imageGrid) return;
        
        const uploadBtn = imageGrid.querySelector('.upload-new');
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview new-image';

        imgContainer.innerHTML = `
            <img src="${e.target.result}" alt="Nova imagem">
            <button type="button" class="remove-new-image">
                <i class="fas fa-times"></i>
            </button>
        `;

        if (uploadBtn) {
            imageGrid.insertBefore(imgContainer, uploadBtn);
        } else {
            imageGrid.appendChild(imgContainer);
        }

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
function setupFileUpload() {
    const fileInput = document.getElementById('imageInput');
    const uploadArea = document.querySelector('.upload-new');

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                if (!file.type.startsWith('image/')) {
                    alert('Selecione apenas imagens.');
                    return;
                }
                newImages.push(file);
                previewNewImage(file);
            });

            e.target.value = '';
            updateImageStats();
        });

        setupDragAndDrop();
    }
}

// ===============================
// DRAG AND DROP
// ===============================
function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-new');
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    uploadArea.addEventListener('drop', e => {
        const files = Array.from(e.dataTransfer.files);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert('Selecione apenas imagens.');
                return;
            }
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
// SALVAR ALTERAÇÕES (CORRIGIDO)
// ===============================
function setupFormSubmit() {
    const form = document.getElementById("editVehicleForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("id", vehicleId);
            
            const fields = ['marca', 'modelo', 'ano', 'km', 'preco', 'status', 'destaque', 'categoria', 'combustivel', 'cambio', 'descricao'];
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    formData.append(field, element.value);
                }
            });

            if (document.getElementById("status").value === "sold") {
                const dataCompra = document.getElementById("data_compra").value;
                formData.append("data_compra", dataCompra || new Date().toISOString().split('T')[0]);
            }

            removedImages.forEach(img => {
                if (img) formData.append("removed_images[]", img);
            });
            
            newImages.forEach(file => {
                formData.append("images[]", file);
            });

            const res = await fetch(API_URL, {
                method: "POST",
                body: formData,
                credentials: 'include'
            });

            if (res.status === 401) {
                throw new Error('Não autorizado');
            }

            const data = await handleApiResponse(res);

            if (data.success) {
                alert("Veículo atualizado com sucesso!");
                window.location.href = "estoque.html";
            } else {
                throw new Error(data.message || "Erro ao atualizar veículo");
            }
        } catch (error) {
            console.error("Erro:", error);
            
            if (error.message.includes('Não autorizado')) {
                alert("Acesso restrito a administradores. Faça login como administrador.");
                window.location.href = '../../html/login.html';
            } else {
                alert("Erro ao atualizar veículo: " + error.message);
            }
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página editar_estoque carregada');

    const statusElement = document.getElementById("status");
    if (statusElement) {
        statusElement.addEventListener("change", function() {
            togglePurchaseDate(this.value);
        });
    }

    setupFileUpload();
    setupFormSubmit();
    loadVehicleData();
});