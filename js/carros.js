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
        this.currentFilters = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🚗 Iniciando CarListing...');
            
            // Aguardar o footer carregar primeiro
            await this.waitForFooter();
            
            await this.loadBrands();
            await this.loadCars();
            this.setupEventListeners();
            this.adjustLayout();
            
            this.isInitialized = true;
            console.log('✅ CarListing inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showError('Erro ao inicializar a listagem de carros');
        }
    }

    async waitForFooter() {
        return new Promise((resolve) => {
            const maxWaitTime = 10000; // 10 segundos máximo
            const startTime = Date.now();
            
            const checkFooter = () => {
                const footer = document.querySelector('footer');
                const currentTime = Date.now();
                
                // Verificar se footer existe e tem conteúdo significativo
                if (footer && footer.innerHTML && footer.innerHTML.length > 200) {
                    console.log('✅ Footer carregado com conteúdo');
                    resolve();
                    return;
                }
                
                // Timeout após 10 segundos
                if (currentTime - startTime > maxWaitTime) {
                    console.warn('⚠️ Timeout aguardando footer, continuando...');
                    resolve();
                    return;
                }
                
                // Continuar verificando
                setTimeout(checkFooter, 100);
            };
            
            checkFooter();
        });
    }

    async loadBrands() {
        try {
            console.log('📋 Carregando marcas...');
            const response = await fetch(`${this.API_URL}?limit=100`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success && data.data && data.data.vehicles) {
                const brands = [...new Set(data.data.vehicles.map(car => car.marca).filter(Boolean))];
                this.populateBrandFilter(brands);
                console.log(`✅ ${brands.length} marcas carregadas`);
            } else {
                throw new Error(data.message || 'Erro ao carregar marcas');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar marcas:', error);
        }
    }

    populateBrandFilter(brands) {
        const brandSelect = this.filters.brand;
        if (!brandSelect) return;

        // Manter apenas a primeira opção ("Todas as Marcas")
        const firstOption = brandSelect.options[0];
        brandSelect.innerHTML = '';
        if (firstOption) {
            brandSelect.appendChild(firstOption);
        }

        // Ordenar marcas alfabeticamente
        brands.sort((a, b) => a.localeCompare(b));
        
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    }

    async loadCars(filters = {}) {
        try {
            this.showLoading();

            const params = new URLSearchParams();
            params.append('limit', '12');

            // Aplicar filtros
            this.currentFilters = { ...filters };

            // Filtro por marca
            if (filters.brand && filters.brand !== 'all') {
                params.append('marca', filters.brand);
            }

            // Filtro por condição (status)
            if (filters.condition && filters.condition !== 'all') {
                const statusMap = {
                    'sold': 'sold',
                    'available': 'available',
                    'reserved': 'reserved'
                };
                params.append('status', statusMap[filters.condition] || filters.condition);
            } else {
                // Padrão: mostrar apenas disponíveis e reservados
                params.append('status', 'available,reserved');
            }

            // Filtro por preço
            if (filters.price && filters.price !== 'all') {
                const [min, max] = this.parsePriceRange(filters.price);
                if (min !== null) params.append('preco_min', min);
                if (max !== null) params.append('preco_max', max);
            }

            // Filtro por transmissão
            if (filters.transmission && filters.transmission !== 'all') {
                // params.append('cambio', filters.transmission);
            }

            const url = `${this.API_URL}?${params.toString()}`;
            console.log('🔍 Buscando carros:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                const cars = data.data.vehicles || [];
                this.displayCars(cars);
                this.updateResultsCount(cars.length);
                console.log(`✅ ${cars.length} carros carregados`);
                
                // Ajustar layout após carregar os carros
                setTimeout(() => this.adjustLayout(), 200);
            } else {
                throw new Error(data.message || 'Erro ao carregar carros');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar carros:', error);
            this.showError(this.getUserFriendlyError(error.message));
        }
    }

    adjustLayout() {
        const mainContent = document.querySelector('.main-content');
        const footer = document.querySelector('footer');
        
        if (mainContent && footer) {
            // Reset da altura mínima
            mainContent.style.minHeight = 'auto';
            
            const windowHeight = window.innerHeight;
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const footerHeight = footer.offsetHeight;
            
            // Calcular altura mínima para conteúdo
            const contentHeight = windowHeight - headerHeight - footerHeight - 80;
            const minHeight = Math.max(contentHeight, 500);
            
            mainContent.style.minHeight = `${minHeight}px`;
            
            console.log('📐 Layout ajustado:', {
                windowHeight,
                headerHeight,
                footerHeight,
                minHeight
            });
        }
    }

    displayCars(cars) {
        if (!this.carGrid) return;

        if (!cars || cars.length === 0) {
            this.carGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-car fa-3x"></i>
                    <h3>Nenhum carro encontrado</h3>
                    <p>Tente ajustar os filtros para ver mais resultados.</p>
                    <button class="btn btn-secondary" onclick="carListing.clearFilters()">Limpar Filtros</button>
                </div>
            `;
            this.updateResultsCount(0);
            return;
        }

        this.carGrid.innerHTML = cars.map(car => this.createCarCard(car)).join('');
        this.setupFavoriteButtons();
        this.setupImageErrorHandling();
    }

    createCarCard(car) {
        const mainImage = car.images && car.images.length > 0 ? 
            car.images[0] : '../img/placeholder-car.jpg';
        
        const price = car.preco ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(car.preco) : 'Preço sob consulta';

        const statusClass = this.getStatusClass(car.status);
        const statusText = this.getStatusText(car.status);
        
        const km = car.km ? `${car.km.toLocaleString('pt-BR')} km` : 'KM não informada';
        const year = car.ano || 'Ano N/I';

        // Verificar se é novo (ano atual ou próximo)
        const currentYear = new Date().getFullYear();
        const isNew = car.ano && (car.ano >= currentYear - 1);

        return `
            <div class="car-card" data-id="${car.id || ''}" data-status="${car.status || ''}">
                <div class="car-image">
                    <img src="${mainImage}" 
                         alt="${car.marca || ''} ${car.modelo || ''}" 
                         loading="lazy"
                         onerror="this.src='../img/placeholder-car.jpg'">
                    
                    <span class="car-status ${statusClass}">${statusText}</span>
                    
                    ${car.destaque === 'sim' ? '<span class="featured-badge">Destaque</span>' : ''}
                    
                    ${isNew ? '<span class="new-badge">Novo</span>' : ''}
                    
                    <button class="favorite-btn" data-car-id="${car.id || ''}" aria-label="Favoritar carro">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <div class="car-info">
                    <div class="car-header">
                        <h3 class="car-title">${car.marca || ''} ${car.modelo || ''}</h3>
                        <p class="car-year">${year}</p>
                    </div>
                    
                    <p class="price">${price}</p>
                    
                    <div class="car-details">
                        <span class="detail-item">
                            <i class="fas fa-tachometer-alt"></i>
                            ${km}
                        </span>
                        ${car.combustivel ? `
                        <span class="detail-item">
                            <i class="fas fa-gas-pump"></i>
                            ${this.getFuelTypeText(car.combustivel)}
                        </span>
                        ` : ''}
                        ${car.cambio ? `
                        <span class="detail-item">
                            <i class="fas fa-cog"></i>
                            ${this.getTransmissionText(car.cambio)}
                        </span>
                        ` : ''}
                    </div>
                    
                    <div class="car-actions">
                        <a href="detalhes.html?id=${car.id || ''}" class="btn btn-primary">
                            <i class="fas fa-eye"></i>
                            Ver detalhes
                        </a>
                        <button class="btn btn-secondary contact-btn" data-car-id="${car.id || ''}">
                            <i class="fas fa-phone"></i>
                            Contato
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusClass(status) {
        const statusMap = {
            'available': 'available',
            'reserved': 'reserved',
            'sold': 'sold'
        };
        return statusMap[status] || 'available';
    }

    getStatusText(status) {
        const statusMap = {
            'available': 'Disponível',
            'reserved': 'Reservado',
            'sold': 'Vendido'
        };
        return statusMap[status] || 'Disponível';
    }

    getFuelTypeText(fuel) {
        const fuelMap = {
            'gasolina': 'Gasolina',
            'alcool': 'Álcool',
            'diesel': 'Diesel',
            'flex': 'Flex',
            'eletrico': 'Elétrico',
            'hibrido': 'Híbrido'
        };
        return fuelMap[fuel] || fuel;
    }

    getTransmissionText(transmission) {
        const transmissionMap = {
            'manual': 'Manual',
            'automatico': 'Automático',
            'automatic': 'Automático',
            'semi-automatico': 'Semi-Automático'
        };
        return transmissionMap[transmission] || transmission;
    }

    getUserFriendlyError(errorMessage) {
        if (errorMessage.includes('Failed to fetch')) {
            return 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        if (errorMessage.includes('404')) {
            return 'Serviço indisponível no momento. Tente novamente mais tarde.';
        }
        if (errorMessage.includes('500')) {
            return 'Erro interno do servidor. Tente novamente em alguns instantes.';
        }
        return errorMessage;
    }

    setupEventListeners() {
        // Filtros
        Object.values(this.filters).forEach(select => {
            if (select) {
                select.addEventListener('change', () => this.applyFilters());
            }
        });

        // Botão limpar filtros
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Busca em tempo real
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.handleSearch(), 300));
        }

        // Redimensionamento da janela
        window.addEventListener('resize', this.debounce(() => this.adjustLayout(), 250));
        
        // Scroll para ajustar layout quando necessário
        window.addEventListener('scroll', this.debounce(() => {
            this.checkLayout();
        }, 100));
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

    clearFilters() {
        Object.values(this.filters).forEach(select => {
            if (select) select.value = 'all';
        });
        
        this.loadCars({});
        this.showToast('Filtros limpos com sucesso', 'info');
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.trim();
        if (searchTerm.length >= 2) {
            // Implementar busca se necessário
            console.log('🔍 Buscar por:', searchTerm);
        } else if (searchTerm.length === 0) {
            this.loadCars(this.currentFilters);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    checkLayout() {
        const footer = document.querySelector('footer');
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Se o footer está muito alto na tela, ajustar layout
            if (footerRect.top < viewportHeight * 0.8) {
                this.adjustLayout();
            }
        }
    }

    setupFavoriteButtons() {
        const favoriteBtns = document.querySelectorAll('.favorite-btn');
        
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(btn);
            });
        });

        // Botões de contato
        const contactBtns = document.querySelectorAll('.contact-btn');
        contactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleContact(btn);
            });
        });
    }

    setupImageErrorHandling() {
        const images = document.querySelectorAll('.car-image img');
        images.forEach(img => {
            img.addEventListener('error', () => {
                img.src = '../img/placeholder-car.jpg';
                console.log('🖼️ Imagem substituída por placeholder');
            });
            
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        });
    }

    toggleFavorite(btn) {
        const icon = btn.querySelector('i');
        const isActive = btn.classList.contains('active');
        const carId = btn.getAttribute('data-car-id');
        
        if (isActive) {
            btn.classList.remove('active');
            icon.classList.replace('fas', 'far');
            icon.style.color = '';
            this.showToast('Carro removido dos favoritos', 'info');
        } else {
            btn.classList.add('active');
            icon.classList.replace('far', 'fas');
            icon.style.color = '#e74c3c';
            this.showToast('Carro adicionado aos favoritos', 'success');
        }

        // Salvar no localStorage
        this.saveFavoriteState(carId, !isActive);
    }

    saveFavoriteState(carId, isFavorite) {
        try {
            const favorites = JSON.parse(localStorage.getItem('carFavorites')) || {};
            if (isFavorite) {
                favorites[carId] = true;
            } else {
                delete favorites[carId];
            }
            localStorage.setItem('carFavorites', JSON.stringify(favorites));
        } catch (error) {
            console.error('❌ Erro ao salvar favorito:', error);
        }
    }

    handleContact(btn) {
        const carId = btn.getAttribute('data-car-id');
        const carTitle = btn.closest('.car-card').querySelector('.car-title').textContent;
        
        this.showToast(`Entre em contato para mais informações sobre: ${carTitle}`, 'info');
        console.log('📞 Contato solicitado para o carro:', carId);
        
        // Aqui você pode abrir um modal de contato ou redirecionar
        // this.openContactModal(carId);
    }

    updateResultsCount(count) {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${count} carro(s) encontrado(s)`;
            resultsCount.style.fontWeight = '600';
            resultsCount.style.color = 'var(--primary-color)';
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

    showLoading() {
        if (this.carGrid) {
            this.carGrid.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin fa-3x"></i>
                    </div>
                    <p class="loading-text">Carregando carros...</p>
                </div>
            `;
        }
    }

    showError(message) {
        if (this.carGrid) {
            this.carGrid.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                    </div>
                    <h3 class="error-title">Oops! Algo deu errado</h3>
                    <p class="error-message">${message}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="carListing.loadCars()">
                            <i class="fas fa-redo"></i>
                            Tentar Novamente
                        </button>
                        <button class="btn btn-secondary" onclick="carListing.clearFilters()">
                            <i class="fas fa-times"></i>
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showToast(message, type = 'info') {
        // Criar elemento toast se não existir
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Remover após 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Adicionar estilos CSS para animações
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-container {
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
    }
    
    .loading-spinner {
        margin-bottom: 20px;
        color: var(--secondary-color);
    }
    
    .loading-text {
        color: var(--text-light);
        font-size: 16px;
        font-weight: 500;
    }
    
    .error-container {
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
    }
    
    .error-icon {
        margin-bottom: 20px;
        color: var(--accent-color);
    }
    
    .error-title {
        color: var(--dark-color);
        margin-bottom: 12px;
        font-size: 1.5rem;
    }
    
    .error-message {
        color: var(--text-light);
        margin-bottom: 25px;
        font-size: 1.1rem;
    }
    
    .error-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .no-results {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-light);
        grid-column: 1 / -1;
    }
    
    .no-results i {
        margin-bottom: 20px;
        color: #bdc3c7;
        display: block;
    }
    
    .no-results h3 {
        color: var(--dark-color);
        margin-bottom: 12px;
    }
    
    .new-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: #27ae60;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 2;
    }
    
    .featured-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--accent-color);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 2;
    }
`;
document.head.appendChild(toastStyles);

// Variável global para acesso
let carListing;

// Inicialização controlada
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM Content Loaded - Iniciando aplicação...');
    
    // Aguardar um pouco para garantir que tudo está pronto
    setTimeout(() => {
        carListing = new CarListing();
    }, 100);
});

// Exportar para uso global
window.CarListing = CarListing;
window.carListing = carListing;

// Garantir que o layout seja ajustado quando a página terminar de carregar
window.addEventListener('load', function() {
    console.log('📄 Página totalmente carregada');
    if (carListing && carListing.adjustLayout) {
        setTimeout(() => {
            carListing.adjustLayout();
        }, 500);
    }
});