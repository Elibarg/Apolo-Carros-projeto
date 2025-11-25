class CarListing {
    constructor() {
        this.API_URL = "../backend/api/vehicles.php";
        this.carGrid = document.querySelector('.car-grid');
        this.filters = {
            condition: document.getElementById('condition'),
            brand: document.getElementById('brand'),
            price: document.getElementById('price'),
            transmission: document.getElementById('transmission')
        };
        this.init();
    }

    async init() {
        await this.loadBrands();
        await this.loadCars();
        this.setupEventListeners();
    }

    async loadBrands() {
        try {
            const response = await fetch(`${this.API_URL}?limit=100`);
            const data = await response.json();

            if (data.success) {
                const brands = [...new Set(data.data.vehicles.map(car => car.marca))];
                this.populateBrandFilter(brands);
            }
        } catch (error) {
            console.error('Erro ao carregar marcas:', error);
        }
    }

    populateBrandFilter(brands) {
        const brandSelect = this.filters.brand;
        while (brandSelect.children.length > 1) {
            brandSelect.removeChild(brandSelect.lastChild);
        }

        brands.forEach(brand => {
            if (brand) {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            }
        });
    }

    async loadCars(filters = {}) {
        try {
            this.showLoading();

            let url = this.API_URL + '?';
            const params = new URLSearchParams();

            // Marca
            if (filters.brand && filters.brand !== 'all') {
                params.append('marca', filters.brand);
            }

            // Status / condição
            if (filters.condition && filters.condition !== 'all') {
                const statusMap = {
                    'sold': 'sold',
                    'available': 'available',
                    'reserved': 'reserved'
                };
                params.append('status', statusMap[filters.condition] || filters.condition);
            } else {
                // ❗ Padrão: não mostrar carros vendidos
                params.append('status', 'available,reserved');
            }

            // Preço
            if (filters.price && filters.price !== 'all') {
                const [min, max] = this.parsePriceRange(filters.price);
                if (min !== null) params.append('preco_min', min);
                if (max !== null) params.append('preco_max', max);
            }

            url += params.toString();
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.displayCars(data.data.vehicles);
            } else {
                this.showError('Erro ao carregar carros');
            }
        } catch (error) {
            console.error('Erro ao carregar carros:', error);
            this.showError('Erro ao carregar carros');
        } finally {
            this.hideLoading();
        }
    }

    parsePriceRange(priceRange) {
        switch (priceRange) {
            case '0-50000': return [0, 50000];
            case '50000-100000': return [50000, 100000];
            case '100000-150000': return [100000, 150000];
            case '150000+': return [150000, null];
            default: return [null, null];
        }
    }

    displayCars(cars) {
        if (!this.carGrid) return;

        if (cars.length === 0) {
            this.carGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-car fa-3x"></i>
                    <h3>Nenhum carro encontrado</h3>
                    <p>Tente ajustar os filtros para ver mais resultados.</p>
                </div>
            `;
            return;
        }

        this.carGrid.innerHTML = cars.map(car => this.createCarCard(car)).join('');
        this.setupFavoriteButtons();
    }

    createCarCard(car) {
        const mainImage = car.images && car.images.length > 0 ? car.images[0] : '../img/placeholder-car.jpg';
        const price = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(car.preco);

        const statusClass = car.status === 'sold' ? 'sold' : 'available';
        const statusText = car.status === 'sold' ? 'Vendido' : 'Disponível';

        return `
            <div class="car-card" data-id="${car.id}">
                <div class="car-image">
                    <img src="${mainImage}" alt="${car.marca} ${car.modelo}" 
                         onerror="this.src='../img/placeholder-car.jpg'">
                    <span class="car-status ${statusClass}">${statusText}</span>
                    ${car.destaque === 'sim' ? '<span class="featured-badge">Destaque</span>' : ''}
                    <span class="favorite" data-car-id="${car.id}">
                        <i class="far fa-heart"></i>
                    </span>
                </div>
                <div class="car-info">
                    <h3>${car.marca} ${car.modelo}</h3>
                    <p class="price">${price}</p>
                    <p class="details">${car.ano} • ${car.km.toLocaleString()} km</p>
                    <div class="car-actions">
                        <a href="detalhes.html?id=${car.id}" class="btn btn-primary">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        Object.values(this.filters).forEach(select => {
            if (select) {
                select.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    applyFilters() {
        const filters = {
            condition: this.filters.condition?.value,
            brand: this.filters.brand?.value,
            price: this.filters.price?.value,
            transmission: this.filters.transmission?.value
        };
        
        this.loadCars(filters);
    }

    setupFavoriteButtons() {
        const favoriteBtns = document.querySelectorAll('.favorite');
        
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFavorite(btn);
            });
        });
    }

    toggleFavorite(btn) {
        const icon = btn.querySelector('i');
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
            icon.classList.replace('far', 'fas');
            icon.style.color = '#e74c3c';
        } else {
            icon.classList.replace('fas', 'far');
            icon.style.color = '';
        }
    }

    showLoading() {
        if (this.carGrid) {
            this.carGrid.innerHTML = `
                <div class="loading-message">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>Carregando carros...</p>
                </div>
            `;
        }
    }

    hideLoading() {}

    showError(message) {
        if (this.carGrid) {
            this.carGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3>${message}</h3>
                    <button class="btn btn-primary" onclick="location.reload()">Tentar Novamente</button>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new CarListing();
});
