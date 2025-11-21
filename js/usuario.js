        // ✅ CONFIGURAÇÃO DE CAMINHOS (SEM DEPENDÊNCIA EXTERNA)
        document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.style.position = 'relative';
        menuToggle.style.top = '30px';
        menuToggle.style.left = '30px';
        menuToggle.style.transform = 'translateY(-50%)';
        console.log('✅ Posição do menu-toggle forçada via JavaScript');
    }
});
        function getBasePath() {
            const currentPath = window.location.pathname;
            
            // Verificar se está na pasta usuario
            if (currentPath.includes('/usuario/')) {
                return '../../';
            } 
            // Verificar se está na pasta adm
            else if (currentPath.includes('/adm/')) {
                return '../../';
            }
            // Verificar se está na pasta html
            else if (currentPath.includes('/html/')) {
                return '../';
            }
            // Para outras páginas (raiz)
            else {
                return './';
            }
        }
        
        function getComponentsPath() {
            const basePath = getBasePath();
            return basePath + 'components/';
        }
        
        function getApiBaseUrl() {
            const basePath = getBasePath();
            return basePath + 'backend/api/';
        }

        // ✅ FUNÇÃO PARA CARREGAR COMPONENTES
        function loadComponent(selector, path) {
            fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    document.querySelector(selector).innerHTML = data;
                    console.log(`✅ ${selector} carregado com sucesso`);
                })
                .catch(error => {
                    console.error(`❌ Erro ao carregar ${selector}:`, error);
                });
        }

        // ✅ CARREGAR MENU LATERAL
        function loadMenu() {
            console.log('📂 Carregando menu lateral...');
            
            fetch('../../html/usuario/general/menu.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(menuHTML => {
                    document.querySelector('.sidebar-container').innerHTML = menuHTML;
                    console.log('✅ Menu lateral carregado');
                    
                    // Inicializar eventos do menu
                    initMenuEvents();
                    
                    // Atualizar dados do usuário no menu
                    updateMenuUserData();
                })
                .catch(error => {
                    console.error('❌ Erro ao carregar menu:', error);
                    // Criar menu básico em caso de erro
                    createFallbackMenu();
                });
        }

        // ✅ ABRIR MENU
        function openMenu() {
            console.log('📱 Abrindo menu lateral...');
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (sidebar) {
                sidebar.classList.add('active');
            }
            if (overlay) {
                overlay.classList.add('active');
            }
            
            // Prevenir scroll do body
            document.body.style.overflow = 'hidden';
        }

        // ✅ FECHAR MENU
        function closeMenu() {
            console.log('❌ Fechando menu lateral...');
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (sidebar) {
                sidebar.classList.remove('active');
            }
            if (overlay) {
                overlay.classList.remove('active');
            }
            
            // Restaurar scroll do body
            document.body.style.overflow = '';
        }

        // ✅ INICIALIZAR EVENTOS DO MENU
        function initMenuEvents() {
            console.log('🎯 Configurando eventos do menu...');
            
            // Botão para abrir menu
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) {
                menuToggle.addEventListener('click', openMenu);
            }
            
            // Botão para fechar menu
            const closeBtn = document.querySelector('.close-sidebar');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMenu);
            }
            
            // Overlay para fechar menu
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.addEventListener('click', closeMenu);
            }
            
            // Prevenir que cliques no menu fechem ele
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
            
            console.log('✅ Eventos do menu configurados');
        }

        // ✅ ATUALIZAR DADOS DO USUÁRIO NO MENU
        function updateMenuUserData() {
            const userData = AuthService.getUserData();
            
            if (userData) {
                console.log('👤 Atualizando dados do usuário no menu:', userData.nome_completo);
                
                // Aguardar um pouco para garantir que o menu foi renderizado
                setTimeout(() => {
                    const userName = document.querySelector('.user-profile h3');
                    const userEmail = document.querySelector('.user-profile p');
                    
                    if (userName) {
                        userName.textContent = userData.nome_completo || 'Usuário';
                    }
                    if (userEmail) {
                        userEmail.textContent = userData.email || 'email@exemplo.com';
                    }
                    
                    // Adicionar botão de logout se não existir
                    addLogoutToMenu();
                }, 100);
            }
        }

        // ✅ ADICIONAR BOTÃO DE LOGOUT NO MENU
        function addLogoutToMenu() {
            const userMenu = document.querySelector('.user-menu ul');
            
            if (userMenu && !document.querySelector('.logout-menu-item')) {
                const logoutItem = document.createElement('li');
                logoutItem.className = 'logout-menu-item';
                logoutItem.innerHTML = `
                    <a href="#" onclick="handleMenuLogout(event)">
                        <i class="fas fa-sign-out-alt"></i> Sair
                    </a>
                `;
                userMenu.appendChild(logoutItem);
            }
        }

        // ✅ LOGOUT DO MENU
        function handleMenuLogout(event) {
            event.preventDefault();
            closeMenu();
            
            if (confirm('Tem certeza que deseja sair?')) {
                logout();
            }
        }

        // ✅ MENU DE FALLBACK (EM CASO DE ERRO) - CORRIGIDA
    function createFallbackMenu() {
        console.log('🔄 Criando menu de fallback...');
        
        const fallbackMenu = `
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <span class="close-sidebar">&times;</span>
                </div>
                
                <div class="user-profile">
                    <div class="avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <h3>Usuário</h3>
                    <p>email@exemplo.com</p>
                </div>

                <nav class="user-menu">
                    <ul>
                        <li><a href="../../html/index.html"><i class="fas fa-home"></i> Início</a></li>
                        <li><a href="../../html/usuario/usuario.html"><i class="fas fa-user"></i> Perfil</a></li>
                        <li><a href="../../html/anunciar.html"><i class="fas fa-car"></i> Anunciar</a></li>
                        <li><a href="../../html/usuario/anuncios.html"><i class="fas fa-list"></i> Meus anúncios</a></li>
                        <li><a href="../../html/usuario/favoritos.html"><i class="fas fa-heart"></i> Favoritos</a></li>
                        <li><a href="../../html/financeiro.html"><i class="fas fa-money-bill-wave"></i> Financiamento</a></li>
                        <li><a href="../../html/usuario/notificacoes.html"><i class="fas fa-bell"></i> Notificações</a></li>
                        <li class="logout-menu-item">
                            <a href="#" onclick="handleMenuLogout(event)">
                                <i class="fas fa-sign-out-alt"></i> Sair
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
        `;
        
        // ✅ GARANTIR QUE O CONTAINER EXISTE
        if (!document.querySelector('.sidebar-container')) {
            const container = document.createElement('div');
            container.className = 'sidebar-container';
            document.body.appendChild(container);
        }
        
        document.querySelector('.sidebar-container').innerHTML = fallbackMenu;
        initMenuEvents();
        updateMenuUserData();
    }
    // ✅ VERIFICAR E CRIAR ELEMENTOS BÁSICOS
    function checkAndCreateBasicElements() {
        console.log('🔍 Verificando elementos básicos...');
        
        // Criar container do menu se não existir
        if (!document.querySelector('.sidebar-container')) {
            const container = document.createElement('div');
            container.className = 'sidebar-container';
            document.body.appendChild(container);
            console.log('✅ Container do menu criado');
        }
        
        // Criar overlay se não existir
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            console.log('✅ Overlay criado');
        }
    }
        // ✅ DEBUG - Verificar se elementos do menu existem e estão funcionando
        function debugMenu() {
            console.clear();
            console.log('🔍=== DEBUG DO MENU ===🔍');
            
            // Verificar elementos importantes
            const elements = {
                'Menu Toggle': document.querySelector('.menu-toggle'),
                'Sidebar': document.querySelector('.sidebar'),
                'Overlay': document.querySelector('.sidebar-overlay'),
                'Close Button': document.querySelector('.close-sidebar'),
                'User Profile Name': document.querySelector('.user-profile h3'),
                'User Profile Email': document.querySelector('.user-profile p'),
                'Menu Links': document.querySelectorAll('.user-menu a')
            };
            
            console.log('📋 ELEMENTOS ENCONTRADOS:');
            Object.entries(elements).forEach(([name, element]) => {
                if (element) {
                    console.log(`✅ ${name}:`, element);
                    if (name === 'Menu Links') {
                        console.log(`   📎 Quantidade: ${element.length} links`);
                    }
                } else {
                    console.log(`❌ ${name}: NÃO ENCONTRADO`);
                }
            });
            
            // Verificar classes ativas
            console.log('🎯 STATUS ATUAL:');
            console.log('Sidebar tem classe "active":', document.querySelector('.sidebar')?.classList.contains('active'));
            console.log('Overlay tem classe "active":', document.querySelector('.sidebar-overlay')?.classList.contains('active'));
            
            // Verificar dados do usuário
            const userData = AuthService.getUserData();
            console.log('👤 DADOS DO USUÁRIO:', userData);
            
            // Verificar eventos
            console.log('⚡ TESTANDO EVENTOS:');
            
            // Testar abertura do menu
            setTimeout(() => {
                console.log('--- Testando abertura do menu ---');
                openMenu();
                
                setTimeout(() => {
                    console.log('✅ Menu deveria estar aberto agora');
                    console.log('Sidebar active:', document.querySelector('.sidebar')?.classList.contains('active'));
                    console.log('Overlay active:', document.querySelector('.sidebar-overlay')?.classList.contains('active'));
                    
                    // Testar fechamento
                    setTimeout(() => {
                        console.log('--- Testando fechamento do menu ---');
                        closeMenu();
                        
                        setTimeout(() => {
                            console.log('✅ Menu deveria estar fechado agora');
                            console.log('Sidebar active:', document.querySelector('.sidebar')?.classList.contains('active'));
                            console.log('Overlay active:', document.querySelector('.sidebar-overlay')?.classList.contains('active'));
                            
                            // Mostrar resumo
                            showDebugSummary();
                        }, 500);
                    }, 1000);
                }, 500);
            }, 100);
        }

        // ✅ RESUMO DO DEBUG
        function showDebugSummary() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            const toggle = document.querySelector('.menu-toggle');
            
            let summary = `
🎯 RESUMO DO DEBUG DO MENU:

${toggle ? '✅ Botão menu encontrado' : '❌ Botão menu NÃO encontrado'}
${sidebar ? '✅ Sidebar encontrado' : '❌ Sidebar NÃO encontrado'} 
${overlay ? '✅ Overlay encontrado' : '❌ Overlay NÃO encontrado'}

📊 STATUS:
Menu ${sidebar?.classList.contains('active') ? 'ABERTO' : 'FECHADO'}
Overlay ${overlay?.classList.contains('active') ? 'VISÍVEL' : 'OCULTO'}

💡 AÇÕES:
• Clique no botão "Menu" para abrir
• Clique no "×" ou fora para fechar
• Verifique o console para detalhes
            `;
            
            alert(summary);
        }

        // Funções de debug existentes
        function debugLocalStorage() {
            console.log('🔍 Debug do localStorage:');
            console.log('user_data:', localStorage.getItem('user_data'));
            console.log('user_additional_data:', localStorage.getItem('user_additional_data'));
            console.log('userData do AuthService:', AuthService.getUserData());
        }

        function debugUserData() {
            const userData = AuthService.getUserData();
            console.log('📋 Dados do usuário:', userData);
            
            const additionalData = localStorage.getItem('user_additional_data');
            console.log('📋 Dados adicionais:', additionalData ? JSON.parse(additionalData) : 'Nenhum');
        }

        // Limpeza de dados antigos
        function cleanupOldData() {
            const user = AuthService.getUserData();
            if (user && user.id) {
                const currentUserKey = `user_additional_data_${user.id}`;
                const allData = { ...localStorage };
                
                Object.keys(allData).forEach(key => {
                    if (key.startsWith('user_additional_data') && key !== currentUserKey) {
                        localStorage.removeItem(key);
                    }
                });
            }
        }

        // Salvar dados específicos por usuário
        function saveUserAdditionalData(userData) {
            const user = AuthService.getUserData();
            if (!user || !user.id) return;
            
            const storageKey = `user_additional_data_${user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(userData));
        }

        // Carregar dados específicos por usuário
        function loadUserAdditionalData() {
            const user = AuthService.getUserData();
            if (!user || !user.id) {
                console.log('❌ Usuário não autenticado, não carregando dados adicionais');
                return;
            }
            
            const storageKey = `user_additional_data_${user.id}`;
            const userAdditionalData = localStorage.getItem(storageKey);
            
            if (userAdditionalData) {
                const data = JSON.parse(userAdditionalData);
                console.log('📥 Carregando dados específicos do usuário:', data);
                
                // Preencher campos apenas se os dados forem válidos
                if (data.gender && data.gender !== '') document.getElementById('gender').value = data.gender;
                if (data.birthdate && data.birthdate !== '') document.getElementById('birthdate').value = data.birthdate;
                if (data.cpf && data.cpf !== '') document.getElementById('cpf').value = data.cpf;
                if (data.cep && data.cep !== '') document.getElementById('cep').value = data.cep;
                if (data.state && data.state !== '') document.getElementById('state').value = data.state;
                if (data.city && data.city !== '') document.getElementById('city').value = data.city;
                if (data.address && data.address !== '') document.getElementById('address').value = data.address;
                if (data.phone && data.phone !== '') document.getElementById('phone').value = data.phone;
                
                if (data.state && data.state !== '') {
                    loadCitiesFromAPI(data.state, data.city);
                }
            } else {
                console.log('ℹ️ Nenhum dado adicional para este usuário');
                clearFormFields();
            }
        }

        function clearFormFields() {
            document.getElementById('gender').value = '';
            document.getElementById('birthdate').value = '';
            document.getElementById('cpf').value = '';
            document.getElementById('cep').value = '';
            document.getElementById('state').value = '';
            document.getElementById('city').innerHTML = '<option value="">Selecione o estado primeiro</option>';
            document.getElementById('address').value = '';
            document.getElementById('phone').value = '';
        }


        // ✅ CARREGAR COMPONENTES E INICIALIZAR PÁGINA
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Página do usuário carregada');
            
            // ✅ CRIAR ELEMENTOS BÁSICOS PRIMEIRO
            checkAndCreateBasicElements();
            
            // Limpar dados antigos
            cleanupOldData();
            
            // ✅ CORRIGIR CAMINHOS - usar html/usuario/general/
            loadComponent('header', '../../html/usuario/general/header.html');
            loadComponent('footer', '../../html/usuario/general/footer.html');
            
            // Carregar menu lateral
            loadMenu();
            
            // Verificar autenticação
            const userData = AuthService.getUserData();
            
            if (userData) {
                initializeUserPage(userData);
            } else {
                console.log('❌ Usuário não autenticado, redirecionando...');
                showMessage('⚠️ Você precisa estar logado para acessar esta página.', 'error');
                setTimeout(() => {
                    window.location.href = '../../html/login.html';
                }, 2000);
            }
        });

        function updateHeaderForUser() {
            const userData = AuthService.getUserData();
            if (userData) {
                const userInfoElement = document.querySelector('.user-info');
                if (userInfoElement) {
                    userInfoElement.innerHTML = `
                        <span>Olá, ${userData.nome_completo}</span>
                        <div class="user-menu">
                            <a href="usuario.html">Minha Conta</a>
                            <a href="#" onclick="logout()">Sair</a>
                        </div>
                    `;
                }
            }
        }

        // ✅ FUNÇÃO PARA BUSCAR DADOS COMPLETOS DO USUÁRIO DA API
        // ✅ FUNÇÃO PARA BUSCAR DADOS COMPLETOS DO USUÁRIO DA API
    async function fetchUserCompleteData() {
        const userData = AuthService.getUserData();
        if (!userData || !userData.id) {
            console.log('❌ Não há usuário logado');
            return null;
        }

        try {
            console.log('📡 Buscando dados completos do usuário ID:', userData.id);
            
            // ✅ VERIFICAR SE ESTE CAMINHO ESTÁ CORRETO
            const response = await fetch(`../../backend/api/get_user.php?id=${userData.id}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                console.log('✅ Dados completos recebidos:', result.data);
                return result.data;
            } else {
                console.log('❌ Erro ao buscar dados:', result.message);
                return null;
            }
        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            return null;
        }
    }

        async function initializeUserPage(userData) {
            console.log('👤 Inicializando página para:', userData);
            
            // ✅ BUSCAR DADOS COMPLETOS DO BANCO DE DADOS
            showMessage('🔄 Carregando seus dados...', 'info');
            
            const completeUserData = await fetchUserCompleteData();
            
            if (completeUserData) {
                // ✅ PREENCHER FORMULÁRIO COM DADOS COMPLETOS DO BANCO
                fillFormWithUserData(completeUserData);
                showMessage('✅ Dados carregados com sucesso!', 'success');
            } else {
                // ❌ SE NÃO CONSEGUIR BUSCAR, USA OS DADOS BÁSICOS DO LOCALSTORAGE
                console.log('⚠️ Usando dados básicos do localStorage');
                document.getElementById('email').value = userData.email;
                document.getElementById('fullname').value = userData.nome_completo;
                showMessage('⚠️ Alguns dados podem estar incompletos', 'info');
            }
            
            // ✅ MESMO ASSIM TENTA CARREGAR DADOS ADICIONAIS DO LOCALSTORAGE
            loadUserAdditionalData();
            
            // Configurar formulário
            setupUserForm();
            
            // Configurar máscaras
            setupMasks();
            
            // Atualizar mensagem de boas-vindas
            updateWelcomeMessage(userData);
        }

        // ✅ FUNÇÃO PARA PREENCHER FORMULÁRIO COM DADOS COMPLETOS
        function fillFormWithUserData(userData) {
            console.log('📝 Preenchendo formulário com:', userData);
            
            // Dados básicos (sempre disponíveis)
            document.getElementById('email').value = userData.email || '';
            document.getElementById('fullname').value = userData.nome_completo || '';
            
            // Dados adicionais (podem ser null no banco)
            document.getElementById('gender').value = userData.genero || '';
            document.getElementById('birthdate').value = userData.data_nascimento || '';
            document.getElementById('cpf').value = userData.cpf || '';
            document.getElementById('cep').value = userData.cep || '';
            document.getElementById('state').value = userData.estado || '';
            document.getElementById('address').value = userData.endereco || '';
            document.getElementById('phone').value = userData.telefone || '';
            
            // Cidade precisa carregar as opções primeiro
            if (userData.estado && userData.cidade) {
                loadCitiesFromAPI(userData.estado, userData.cidade);
            } else {
                document.getElementById('city').innerHTML = '<option value="">Selecione o estado primeiro</option>';
            }
            
            // ✅ SALVAR DADOS NO LOCALSTORAGE PARA USO FUTURO
            const additionalData = {
                gender: userData.genero,
                birthdate: userData.data_nascimento,
                cpf: userData.cpf,
                cep: userData.cep,
                state: userData.estado,
                city: userData.cidade,
                address: userData.endereco,
                phone: userData.telefone
            };
            saveUserAdditionalData(additionalData);
        }

        // ✅ FUNÇÃO ATUALIZADA PARA MENSAGEM DE BOAS-VINDAS
        function updateWelcomeMessage(userData) {
            let welcomeHTML = `
                <h3>Bem-vindo, ${userData.nome_completo}!</h3>
                <p>Gerencie suas informações pessoais e preferências.</p>
                <div style="margin-top: 10px; font-size: 14px; color: #666;">
                    <strong>Email:</strong> ${userData.email}
            `;
            
            if (userData.tipo_usuario === 'admin') {
                welcomeHTML += ` | <strong>Tipo:</strong> Administrador`;
            }
            
            welcomeHTML += `</div>`;
            
            document.getElementById('userWelcome').innerHTML = welcomeHTML;
        }

        function setupUserForm() {
            const userForm = document.getElementById('userForm');
            
            userForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveUserData();
            });
            
            // Buscar CEP automaticamente
            document.getElementById('cep').addEventListener('blur', function() {
                const cep = this.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    searchCEP(cep);
                }
            });
            
            // Carregar cidades quando estado mudar
            document.getElementById('state').addEventListener('change', function() {
                const state = this.value;
                if (state) {
                    loadCitiesFromAPI(state);
                } else {
                    document.getElementById('city').innerHTML = '<option value="">Selecione o estado primeiro</option>';
                }
            });
            
            // Validação de email em tempo real
            document.getElementById('email').addEventListener('blur', function() {
                validateEmail(this.value);
            });
        }

        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                showMessage('❌ Por favor, insira um email válido', 'error');
                return false;
            }
            return true;
        }

        function validateCPF(cpf) {
            cpf = cpf.replace(/\D/g, '');
            
            if (cpf.length !== 11) {
                return false;
            }
            
            // Verificar se é uma sequência repetida
            if (/^(\d)\1+$/.test(cpf)) {
                return false;
            }
            
            // Validar dígitos verificadores
            let sum = 0;
            let remainder;
            
            for (let i = 1; i <= 9; i++) {
                sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
            }
            
            remainder = (sum * 10) % 11;
            if ((remainder === 10) || (remainder === 11)) remainder = 0;
            if (remainder !== parseInt(cpf.substring(9, 10))) return false;
            
            sum = 0;
            for (let i = 1; i <= 10; i++) {
                sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
            }
            
            remainder = (sum * 10) % 11;
            if ((remainder === 10) || (remainder === 11)) remainder = 0;
            if (remainder !== parseInt(cpf.substring(10, 11))) return false;
            
            return true;
        }

        function setupMasks() {
            // Máscara para CPF (CORRIGIDA)
            document.getElementById('cpf').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    e.target.value = value;
                }
                
                // Validar se tem 11 dígitos
                const digitsOnly = value.replace(/\D/g, '');
                if (digitsOnly.length !== 11 && digitsOnly.length > 0) {
                    e.target.style.borderColor = 'red';
                } else {
                    e.target.style.borderColor = '';
                }
            });
            
            // Máscara para CEP
            document.getElementById('cep').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 8) {
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    e.target.value = value;
                }
            });
            
            // Máscara para telefone
            document.getElementById('phone').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length === 11) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    e.target.value = value;
                } else if (value.length === 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                    e.target.value = value;
                }
            });
        }

        function searchCEP(cep) {
            showMessage('🔍 Buscando CEP...', 'info');
            
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (!data.erro) {
                        document.getElementById('state').value = data.uf;
                        document.getElementById('address').value = `${data.logradouro}, ${data.bairro}`;
                        loadCitiesFromAPI(data.uf, data.localidade);
                        showMessage('✅ Endereço preenchido automaticamente!', 'success');
                    } else {
                        showMessage('❌ CEP não encontrado', 'error');
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar CEP:', error);
                    showMessage('❌ Erro ao buscar CEP', 'error');
                });
        }

        async function loadCitiesFromAPI(state, selectedCity = '') {
            const citySelect = document.getElementById('city');
            
            citySelect.innerHTML = '<option value="">Carregando cidades...</option>';
            
            try {
                const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
                const cities = await response.json();
                
                citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.nome;
                    option.textContent = city.nome;
                    option.selected = (city.nome === selectedCity);
                    citySelect.appendChild(option);
                });
                
                if (selectedCity) {
                    citySelect.value = selectedCity;
                }
                
            } catch (error) {
                console.error('Erro ao carregar cidades:', error);
                loadCitiesFallback(state, selectedCity);
            }
        }

        function loadCitiesFallback(state, selectedCity = '') {
            const citySelect = document.getElementById('city');
            const cities = {
                'SP': ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Guarulhos', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba'],
                'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'São Gonçalo', 'Nova Iguaçu', 'Belford Roxo', 'Campos dos Goytacazes'],
                'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba'],
                'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Novo Hamburgo'],
                'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu'],
                'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí']
            };
            
            const stateCities = cities[state] || ['Capital'];
            
            citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
            stateCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                option.selected = (city === selectedCity);
                citySelect.appendChild(option);
            });
        }

        async function saveUserData() {
            const userData = AuthService.getUserData();
            if (!userData || !userData.id) {
                showMessage('❌ Erro: Usuário não autenticado', 'error');
                return;
            }

            const formData = {
                user_id: userData.id,
                email: document.getElementById('email').value,
                nome_completo: document.getElementById('fullname').value,
                genero: document.getElementById('gender').value,
                data_nascimento: document.getElementById('birthdate').value,
                cpf: document.getElementById('cpf').value,
                cep: document.getElementById('cep').value,
                estado: document.getElementById('state').value,
                cidade: document.getElementById('city').value,
                endereco: document.getElementById('address').value,
                telefone: document.getElementById('phone').value
            };
            
            // ✅ VALIDAÇÕES
            if (!formData.email || !formData.nome_completo || !formData.genero || 
                !formData.data_nascimento || !formData.cpf || !formData.cep || 
                !formData.estado || !formData.cidade || !formData.endereco || 
                !formData.telefone) {
                showMessage('❌ Preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            if (!validateEmail(formData.email)) return;
            
            const cpfClean = formData.cpf.replace(/\D/g, '');
            if (cpfClean.length !== 11) {
                showMessage('❌ CPF deve ter 11 dígitos', 'error');
                return;
            }
            
            // Validar data de nascimento
            const birthDate = new Date(formData.data_nascimento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                showMessage('❌ Você deve ter pelo menos 18 anos', 'error');
                return;
            }
            
            // Mostrar loading
            showMessage('💾 Salvando dados...', 'info');
            
            try {
                // ✅ USAR CAMINHO ABSOLUTO PARA A API
                const apiUrl = '../../backend/api/update_user.php';
                console.log('📤 Enviando para:', apiUrl);
                console.log('📦 Dados:', formData);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                // ✅ VERIFICAR SE A RESPOSTA É JSON VÁLIDO
                const responseText = await response.text();
                console.log('📥 Resposta bruta:', responseText);
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('❌ Erro ao parsear JSON:', parseError);
                    throw new Error('Resposta inválida do servidor: ' + responseText.substring(0, 100));
                }
                
                if (result.success) {
                    // Atualizar dados do usuário no localStorage
                    const updatedUserData = {
                        ...userData,
                        email: formData.email,
                        nome_completo: formData.nome_completo
                    };
                    localStorage.setItem('user_data', JSON.stringify(updatedUserData));
                    
                    // Salvar dados adicionais
                    const additionalData = {
                        gender: formData.genero,
                        birthdate: formData.data_nascimento,
                        cpf: formData.cpf,
                        cep: formData.cep,
                        state: formData.estado,
                        city: formData.cidade,
                        address: formData.endereco,
                        phone: formData.telefone
                    };
                    saveUserAdditionalData(additionalData);
                    
                    showMessage('✅ Dados salvos com sucesso!', 'success');
                    
                    // Atualizar header
                    updateHeaderForUser();
                } else {
                    showMessage('❌ Erro ao salvar: ' + result.message, 'error');
                }
                
            } catch (error) {
                console.error('Erro ao salvar:', error);
                showMessage('❌ Erro: ' + error.message, 'error');
            }
        }

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                console.log('🚪 Usuário solicitou logout - redirecionando para index');
                
                // Mostrar mensagem de carregamento
                showMessage('🚪 Saindo...', 'info');
                
                // Chamar o serviço de logout
                AuthService.logout().then(result => {
                    if (!result.success) {
                        console.log('⚠️ Logout com aviso, mas redirecionando para index:', result.message);
                        // Mesmo com aviso, redireciona para INDEX
                        window.location.href = '../../html/index.html';
                    }
                    // Se foi success, o próprio AuthService já redirecionou
                }).catch(error => {
                    console.error('💥 Erro no logout, redirecionando para index:', error);
                    // Em caso de erro, limpa e redireciona para INDEX
                    localStorage.clear();
                    window.location.href = '../../html/index.html';
                });
            }
        }

        function showMessage(message, type) {
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = `
                <div class="message ${type}">
                    <i class="fas ${
                        type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-triangle' : 
                        'fa-info-circle'
                    }"></i>
                    ${message}
                </div>
            `;
            messageContainer.style.display = 'block';
            
            if (type !== 'error') {
                setTimeout(() => {
                    messageContainer.style.display = 'none';
                }, 5000);
            }
        }