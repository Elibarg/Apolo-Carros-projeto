// js/detalhes.js
class CarDetail {
    constructor() {
        this.API_URL = "../backend/api/vehicles.php";
        this.carId = new URLSearchParams(window.location.search).get('id');
        this.PLACEHOLDER_IMAGE = "../img/Chevrolet_Onix.png";
        this.BASE_URL = window.location.origin; // ✅ Para imagens absolutas
    }

    async init() {
        if (!this.carId) {
            this.showError('ID do carro não especificado.');
            return;
        }

        await this.waitForComponents();
        await this.loadCarDetails();
        this.setupEventListeners();
    }

    waitForComponents() {
        return new Promise((resolve) => {
            const checkComponents = () => {
                const header = document.querySelector('header');
                const nav = document.querySelector('nav');
                const footer = document.querySelector('footer');
                
                if (header && header.innerHTML.trim() !== '' &&
                    nav && nav.innerHTML.trim() !== '' &&
                    footer && footer.innerHTML.trim() !== '') {
                    resolve();
                } else {
                    setTimeout(checkComponents, 100);
                }
            };
            checkComponents();
        });
    }

    async loadCarDetails() {
        try {
            this.showLoading();
            
            console.log('Carregando carro ID:', this.carId);
            const response = await fetch(`${this.API_URL}?id=${this.carId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Resposta da API:', data);

            if (data.success) {
                this.displayCarDetails(data.data);
            } else {
                this.showError(data.message || 'Carro não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do carro:', error);
            this.showError('Erro ao carregar detalhes do carro: ' + error.message);
        }
    }

    displayCarDetails(car) {
        console.log('Exibindo detalhes do carro:', car);
        console.log('Imagens do carro:', car.images);
        
        document.title = `${car.marca} ${car.modelo} | Apolo Carros`;
        this.createPageStructure(car);
        this.updateCarData(car);
    }

    createPageStructure(car) {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="breadcrumb">
                <div class="container">
                    <a href="../html/index.html">Home</a> &gt; 
                    <a href="../html/carros.html">Carros</a> &gt; 
                    <span>${car.marca} ${car.modelo}</span>
                </div>
            </div>

            <section class="car-detail-section">
                <div class="container">
                    <div class="car-detail">
                        <div class="car-gallery">
                            <div class="main-image">
                                <img src="" alt="${car.marca} ${car.modelo}" id="mainCarImage">
                            </div>
                            <div class="thumbnails-container" id="thumbnailsContainer">
                                <!-- Miniaturas serão geradas aqui -->
                            </div>
                        </div>

                        <div class="car-info">
                            <h1 id="carTitle">${car.marca} ${car.modelo} ${car.ano}</h1>
                            <div id="carStatus"></div>
                            <p class="price" id="carPrice">R$ 0,00</p>
                            <div class="car-actions">
                                <button class="btn btn-primary" id="favoriteBtn">
                                    <i class="fas fa-heart"></i> Favoritar
                                </button>
                                <button class="btn btn-outline" id="shareBtn">
                                    <i class="fas fa-share-alt"></i> Compartilhar
                                </button>
                                <button class="btn btn-danger" id="reportBtn">
                                    <i class="fas fa-flag"></i> Denunciar
                                </button>
                            </div>

                            <div class="car-specs">
                                <h2>Detalhes Técnicos</h2>
                                <table class="specs-table" id="specsTable">
                                    <!-- Especificações serão geradas aqui -->
                                </table>
                            </div>

                            <div class="finance-options" id="financeOptions">
                                <!-- Opções de financiamento serão geradas aqui -->
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    updateCarData(car) {
        this.updateGallery(car.images);
        this.updatePrice(car.preco);
        this.updateStatus(car.status, car.destaque);
        this.updateSpecs(car);
        this.updateFinanceOptions(car);
    }

    updateGallery(images) {
        const mainImage = document.getElementById('mainCarImage');
        const thumbnailsContainer = document.getElementById('thumbnailsContainer');
        
        console.log('Atualizando galeria com imagens:', images);

        // ✅ CORREÇÃO: Se não há imagens ou array vazio, usar placeholder
        if (!images || images.length === 0 || (Array.isArray(images) && images.length === 0)) {
            console.log('Nenhuma imagem encontrada, usando placeholder');
            images = [this.PLACEHOLDER_IMAGE];
        }

        // Imagem principal
        if (mainImage && images.length > 0) {
            const firstImage = images[0];
            // ✅ CORREÇÃO: Verificar diferentes formatos de caminho
            let imageSrc = this.getImageUrl(firstImage);
            console.log('Imagem principal:', imageSrc);
            
            mainImage.src = imageSrc;
            mainImage.alt = `${firstImage} - Imagem principal`;
            
            mainImage.onerror = () => {
                console.log('Erro ao carregar imagem principal, usando placeholder');
                mainImage.src = this.PLACEHOLDER_IMAGE;
            };
        }

        // Miniaturas
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = '';
            
            images.forEach((img, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail';
                if (index === 0) thumbnail.classList.add('active');
                
                // ✅ CORREÇÃO: Usar função para obter URL correta
                const imgSrc = this.getImageUrl(img);
                console.log('Miniatura', index, ':', imgSrc);
                
                thumbnail.innerHTML = `
                    <img src="${imgSrc}" alt="Miniatura ${index + 1}" 
                         data-original="${img}" 
                         onerror="this.src='${this.PLACEHOLDER_IMAGE}'">
                `;
                
                const thumbImg = thumbnail.querySelector('img');
                thumbImg.onerror = () => {
                    console.log('Erro ao carregar miniatura', index, 'usando placeholder');
                    thumbImg.src = this.PLACEHOLDER_IMAGE;
                };
                
                thumbnailsContainer.appendChild(thumbnail);
            });
        }
    }

    // ✅ NOVO MÉTODO: Obter URL correta para a imagem
    getImageUrl(imagePath) {
        if (!imagePath) {
            return this.PLACEHOLDER_IMAGE;
        }

        // Se já é uma URL completa
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // Se começa com / (caminho absoluto do servidor)
        if (imagePath.startsWith('/')) {
            // ✅ CORREÇÃO: Para caminhos absolutos, usar base URL
            return this.BASE_URL + imagePath;
        }

        // Se é um caminho relativo
        if (imagePath.startsWith('../') || imagePath.startsWith('./')) {
            return imagePath;
        }

        // Se não tem prefixo, assumir que é relativo à pasta img
        return '../img/' + imagePath;
    }

    updatePrice(price) {
        const priceElement = document.getElementById('carPrice');
        if (priceElement) {
            priceElement.textContent = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(price);
        }
    }

    updateStatus(status, destaque) {
        const statusContainer = document.getElementById('carStatus');
        if (statusContainer) {
            let statusHTML = '';
            
            statusHTML += `
                <div class="car-status ${status === 'sold' ? 'sold' : 'available'}">
                    <i class="fas ${status === 'sold' ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    ${this.getStatusText(status)}
                </div>
            `;
            
            if (destaque === 'sim') {
                statusHTML += `
                    <div class="featured-badge">
                        <i class="fas fa-star"></i> Destaque
                    </div>
                `;
            }
            
            statusContainer.innerHTML = statusHTML;
        }
    }

    updateSpecs(car) {
        const specsTable = document.getElementById('specsTable');
        if (specsTable) {
            specsTable.innerHTML = `
                <tr>
                    <td>Marca</td>
                    <td>${car.marca}</td>
                </tr>
                <tr>
                    <td>Modelo</td>
                    <td>${car.modelo}</td>
                </tr>
                <tr>
                    <td>Ano</td>
                    <td>${car.ano}</td>
                </tr>
                <tr>
                    <td>Quilometragem</td>
                    <td>${car.km.toLocaleString('pt-BR')} km</td>
                </tr>
                <tr>
                    <td>Status</td>
                    <td>${this.getStatusText(car.status)}</td>
                </tr>
                <tr>
                    <td>Destaque</td>
                    <td>${car.destaque === 'sim' ? 'Sim' : 'Não'}</td>
                </tr>
                ${car.data_compra ? `
                <tr>
                    <td>Data da Compra</td>
                    <td>${new Date(car.data_compra).toLocaleDateString('pt-BR')}</td>
                </tr>
                ` : ''}
                ${car.descricao ? `
                <tr>
                    <td>Descrição</td>
                    <td>${car.descricao}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Data de Cadastro</td>
                    <td>${new Date(car.data_cadastro).toLocaleDateString('pt-BR')}</td>
                </tr>
            `;
        }
    }

    updateFinanceOptions(car) {
        const financeOptions = document.getElementById('financeOptions');
        if (financeOptions) {
            if (car.status !== 'sold') {
                const installment = (car.preco * 0.8) / 48;
                financeOptions.innerHTML = `
                    <h2>Opções de Financiamento</h2>
                    <div class="finance-details">
                        <div class="finance-item">
                            <span class="label">Entrada mínima:</span>
                            <span class="value">${new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(car.preco * 0.2)}</span>
                        </div>
                        <div class="finance-item">
                            <span class="label">Parcelas:</span>
                            <span class="value">48x ${new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(installment)}</span>
                        </div>
                        <div class="finance-item">
                            <span class="label">Taxa de juros:</span>
                            <span class="value">1.2% ao mês</span>
                        </div>
                    </div>
                    <a href="../html/financeiro.html?carId=${car.id}&price=${car.preco}" 
                       class="btn btn-primary">
                        <i class="fas fa-calculator"></i> Simular Financiamento
                    </a>
                `;
            } else {
                financeOptions.innerHTML = `
                    <div class="sold-notice">
                        <i class="fas fa-times-circle"></i>
                        <h3>Veículo Vendido</h3>
                        <p>Este veículo não está mais disponível para venda.</p>
                        <a href="../html/carros.html" class="btn btn-primary">Ver Outros Carros</a>
                    </div>
                `;
            }
        }
    }

    getStatusText(status) {
        const statusMap = {
            'available': 'Disponível',
            'reserved': 'Reservado',
            'sold': 'Vendido'
        };
        return statusMap[status] || status;
    }

    setupEventListeners() {
        this.setupImageGallery();
        this.setupActionButtons();
    }

    setupImageGallery() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.thumbnail')) {
                const thumbnail = e.target.closest('.thumbnail');
                const mainImage = document.getElementById('mainCarImage');
                const thumbImg = thumbnail.querySelector('img');
                
                if (mainImage && thumbImg) {
                    mainImage.src = thumbImg.src;
                    mainImage.alt = thumbImg.alt;
                    
                    document.querySelectorAll('.thumbnail').forEach(thumb => {
                        thumb.classList.remove('active');
                    });
                    thumbnail.classList.add('active');
                }
            }
        });
    }

    setupActionButtons() {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFavorite(favoriteBtn);
            });
        }

        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.shareCar();
            });
        }

        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.reportCar();
            });
        }
    }

    toggleFavorite(btn) {
        const icon = btn.querySelector('i');
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
            icon.style.color = '#e74c3c';
            this.showMessage('Carro adicionado aos favoritos!');
        } else {
            icon.style.color = '';
            this.showMessage('Carro removido dos favoritos!');
        }
    }

    shareCar() {
        const carTitle = document.getElementById('carTitle').textContent;
        const carPrice = document.getElementById('carPrice').textContent;
        
        if (navigator.share) {
            navigator.share({
                title: `${carTitle} - Apolo Carros`,
                text: `Confira ${carTitle} por ${carPrice} na Apolo Carros!`,
                url: window.location.href
            }).catch(err => {
                console.log('Erro ao compartilhar:', err);
                this.copyToClipboard();
            });
        } else {
            this.copyToClipboard();
        }
    }

    copyToClipboard() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showMessage('Link copiado para a área de transferência!');
        }).catch(err => {
            console.log('Erro ao copiar:', err);
            this.showMessage('Erro ao copiar link.');
        });
    }

    reportCar() {
        const reason = prompt('Por favor, descreva o motivo da denúncia:');
        if (reason && reason.trim() !== '') {
            this.showMessage('Denúncia enviada com sucesso! Obrigado pela contribuição.');
        }
    }

    showLoading() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin fa-3x"></i>
                        <p>Carregando detalhes do carro...</p>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                        <h2>${message}</h2>
                        <p>O carro solicitado não foi encontrado ou não está mais disponível.</p>
                        <div class="error-actions">
                            <a href="../html/carros.html" class="btn btn-primary">Ver Todos os Carros</a>
                            <a href="../html/index.html" class="btn btn-outline">Voltar para Home</a>
                        </div>
                    </div>
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const carDetail = new CarDetail();
        carDetail.init();
    }, 500);
});