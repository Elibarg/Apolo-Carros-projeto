// js/vehicle-service.js
class VehicleService {
    static async listVehicles(filters = {}) {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`/backend/public/index.php?route=/api/vehicles?${queryString}`);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
            return { success: false, message: 'Erro ao carregar veículos' };
        }
    }

    static async getVehicleById(id) {
        try {
            const response = await fetch(`/backend/public/index.php?route=/api/vehicles/${id}`);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('Erro ao carregar veículo:', error);
            return { success: false, message: 'Erro ao carregar veículo' };
        }
    }

    static async createVehicle(vehicleData) {
        try {
            const token = AuthService.getToken();
            if (!token) {
                return { success: false, message: 'Usuário não autenticado' };
            }

            const response = await fetch('/backend/public/index.php?route=/api/vehicles', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(vehicleData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro ao criar veículo:', error);
            return { success: false, message: 'Erro ao criar veículo' };
        }
    }
}

// Renderização de veículos
function renderVehicles(vehicles, containerSelector = '.car-grid') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (!vehicles || vehicles.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum veículo encontrado.</p>';
        return;
    }

    container.innerHTML = vehicles.map(vehicle => `
        <div class="car-card" data-vehicle-id="${vehicle.id}">
            <div class="car-image">
                <img src="${vehicle.main_image || '../img/Chevrolet_Onix.png'}" alt="${vehicle.brand} ${vehicle.model}">
                <span class="favorite" onclick="toggleFavorite(${vehicle.id})">
                    <i class="far fa-heart"></i>
                </span>
            </div>
            <div class="car-info">
                <h3>${vehicle.brand} ${vehicle.model}</h3>
                <p class="price">R$ ${parseFloat(vehicle.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p class="details">${vehicle.year} • ${vehicle.km.toLocaleString('pt-BR')} km • ${vehicle.city}/${vehicle.state}</p>
                <div class="car-actions">
                    <a href="detalhes.html?id=${vehicle.id}" class="btn btn-primary">Ver detalhes</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Carregar veículos na página
async function loadVehicles(filters = {}) {
    const result = await VehicleService.listVehicles(filters);
    
    if (result.success) {
        renderVehicles(result.data.vehicles);
    } else {
        console.error('Erro ao carregar veículos:', result.message);
        const container = document.querySelector('.car-grid');
        if (container) {
            container.innerHTML = '<p class="error-message">Erro ao carregar veículos. Tente novamente.</p>';
        }
    }
}