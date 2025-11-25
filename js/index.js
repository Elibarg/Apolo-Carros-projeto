// js/index.js
class HomePage {
    constructor() {
        this.API_URL = "../backend/api/vehicles.php";
        this.featuredGrid = document.querySelector('.car-grid');
        this.init();
    }

    async init() {
        await this.loadFeaturedCars();
        this.setupEventListeners();
    }

    async loadFeaturedCars() {
        try {
            // ✅ APENAS CARROS EM DESTAQUE
            const response = await fetch(`${this.API_URL}?destaque=sim&limit=6`);
            const data = await response.json();

            if (data.success) {
                if (data.data.vehicles.length > 0) {
                    this.displayFeaturedCars(data.data.vehicles);
                } else {
                    // Se não houver carros em destaque, mostra mensagem
                    this.showNoFeaturedCars();
                }
            } else {
                this.showErrorMessage('Erro ao carregar carros em destaque');
            }
        } catch (error) {
            console.error('Erro ao carregar carros em destaque:', error);
            this.showErrorMessage('Erro ao carregar carros em destaque');
        }
    }

    displayFeaturedCars(cars) {
        if (!this.featuredGrid) return;

        this.featuredGrid.innerHTML = cars.map(car => this.createCarCard(car)).join('');
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
                    <span class="featured-badge">Destaque</span>
                    <span class="car-status ${statusClass}">${statusText}</span>
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
        // Categorias
        this.setupCategoryCards();
        
        // ✅ REMOVIDO: setupQuickSearch() - não queremos barra de pesquisa no index
    }

    setupCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.querySelector('h3').textContent;
                this.filterByCategory(category);
            });
        });
    }

    filterByCategory(category) {
        // Redirecionar para página de carros com filtro aplicado
        const categoryMap = {
            'Carros elétricos': 'eletrico',
            'Hatches': 'hatch',
            'Picapes': 'picape',
            'Carros econômicos': 'economico'
        };
        
        const filter = categoryMap[category];
        if (filter) {
            window.location.href = `carros.html?category=${filter}`;
        } else {
            window.location.href = 'carros.html';
        }
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
            this.showMessage('Carro adicionado aos favoritos!');
        } else {
            icon.classList.replace('fas', 'far');
            icon.style.color = '';
            this.showMessage('Carro removido dos favoritos!');
        }
    }

    showNoFeaturedCars() {
        if (this.featuredGrid) {
            this.featuredGrid.innerHTML = `
                <div class="no-featured-cars">
                    <i class="fas fa-star fa-3x"></i>
                    <h3>Nenhum carro em destaque no momento</h3>
                    <p>Volte em breve para ver nossos veículos especiais!</p>
                    <a href="carros.html" class="btn btn-primary">Ver Todos os Carros</a>
                </div>
            `;
        }
    }

    showErrorMessage(message) {
        if (this.featuredGrid) {
            this.featuredGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3>${message}</h3>
                    <p>Tente recarregar a página ou volte mais tarde.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recarregar</button>
                </div>
            `;
        }
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flash-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    new HomePage();
});