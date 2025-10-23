// Arquivo: js/perfil_adm.js
class PerfilAdmin {
    constructor() {
        this.userData = null;           // Dados do usuário logado
        this.baseUrl = '/Apolo-Carros-projeto';  // URL base do projeto
        this.photoUpload = null;        // Instância do upload de fotos
        this.init();
    }

    // ✅ INICIALIZAÇÃO PRINCIPAL
    async init() {
        console.log('🚀 Inicializando PerfilAdmin...');
        
        // Verificar se usuário está autenticado e é admin
        await this.verificarAutenticacao();
        
        // Carregar e exibir dados do usuário
        this.carregarDadosUsuario();
        
        // Configurar eventos e formulários
        this.configurarEventListeners();
        this.configurarFormulario();
        this.configurarUploadFoto();
        this.configurarDebug();
        
        console.log('✅ PerfilAdmin inicializado com sucesso');
    }

    // ✅ VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO E É ADMIN
    async verificarAutenticacao() {
        // Obter dados do usuário do localStorage
        this.userData = AuthService.getUserData();
        
        console.log('🔐 Dados do usuário:', this.userData);
        
        // Se não há dados ou não é admin, redirecionar
        if (!this.userData || this.userData.tipo_usuario !== 'admin') {
            console.warn('❌ Acesso não autorizado - redirecionando...');
            alert('Acesso restrito a administradores.');
            window.location.href = `${this.baseUrl}/html/login.html`;
            return;
        }
        
        console.log('✅ Usuário autenticado como admin');
    }

    // ✅ CARREGAR DADOS DO USUÁRIO NA INTERFACE
    carregarDadosUsuario() {
        console.log('👤 Carregando dados do usuário na interface...');
        
        // Preencher dados no header (topo da página)
        document.getElementById('adminName').innerHTML = 
            `${this.userData.nome_completo} <i class="fas fa-chevron-down"></i>`;
        
        // Preencher dados no perfil (formulário principal)
        document.getElementById('profileName').textContent = this.userData.nome_completo;
        document.getElementById('profileEmail').textContent = this.userData.email;
        document.getElementById('nome').value = this.userData.nome_completo;
        document.getElementById('email').value = this.userData.email;

        // ✅ CARREGAR DADOS COMPLETOS DO BANCO DE DADOS
        this.carregarDadosCompletos();
    }

    // ✅ CARREGAR DADOS COMPLETOS DO BANCO DE DADOS
    async carregarDadosCompletos() {
        try {
            console.log('📤 Buscando dados completos do usuário...');
            
            const url = `${this.baseUrl}/backend/api/get_user.php`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include' // Inclui cookies de sessão
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            const text = await response.text();
            
            // ✅ VERIFICAR SE A RESPOSTA É HTML (ERRO 404)
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                throw new Error('Arquivo PHP não encontrado (404)');
            }
            
            const result = JSON.parse(text);
            console.log('📊 Dados completos recebidos:', result);

            if (result.success) {
                // ✅ PREENCHER DADOS ADICIONAIS NO FORMULÁRIO
                this.preencherDadosAdicionais(result.data);
                
                // ✅ PREENCHER INFORMAÇÕES ADICIONAIS DA CONTA
                this.preencherInformacoesAdicionais(result.data);
                
                console.log('✅ Dados completos carregados com sucesso');
            } else {
                console.warn('⚠️ Não foi possível carregar dados completos:', result.message);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados completos:', error);
        }
    }

    // ✅ PREENCHER DADOS ADICIONAIS NO FORMULÁRIO
    preencherDadosAdicionais(dados) {
        console.log('📝 Preenchendo dados adicionais...');
        
        // Preencher telefone se existir
        if (dados.telefone) {
            document.getElementById('telefone').value = this.formatarTelefone(dados.telefone);
        }
        
        // Atualizar dados do usuário com informações do banco
        this.userData = { ...this.userData, ...dados };
    }

    // ✅ PREENCHER INFORMAÇÕES ADICIONAIS DA CONTA
    preencherInformacoesAdicionais(dados) {
        console.log('📋 Preenchendo informações da conta...');
        
        // Data de cadastro
        if (dados.data_cadastro) {
            document.getElementById('dataCadastro').value = 
                new Date(dados.data_cadastro).toLocaleDateString('pt-BR');
        }
        
        // Tipo de usuário
        if (dados.tipo_usuario) {
            document.getElementById('tipoUsuario').value = 
                dados.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário';
        }
        
        // Avatar no header
        if (dados.avatar_url) {
            document.getElementById('headerAvatar').src = dados.avatar_url;
            document.getElementById('profileAvatar').src = dados.avatar_url;
        }
    }

    // ✅ CONFIGURAR EVENT LISTENERS
    configurarEventListeners() {
        console.log('🎯 Configurando event listeners...');
        
        // Configurar logout
        this.configurarLogout();
        
        // Botão cancelar - recarregar dados originais
        document.querySelector('.btn-outline').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔄 Recarregando dados originais...');
            this.carregarDadosUsuario();
        });
    }

    // ✅ CONFIGURAR LOGOUT
    configurarLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚪 Iniciando logout...');
                this.realizarLogout();
            });
        }
    }

    // ✅ REALIZAR LOGOUT
    realizarLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            console.log('✅ Confirmado - realizando logout...');
            AuthService.logout();
        } else {
            console.log('❌ Logout cancelado pelo usuário');
        }
    }

    // ✅ CONFIGURAR UPLOAD DE FOTO
    configurarUploadFoto() {
        const avatarInput = document.getElementById('avatarInput');
        const profileAvatar = document.getElementById('profileAvatar');

        if (avatarInput && profileAvatar) {
            console.log('📸 Configurando upload de foto...');
            
            this.photoUpload = new PhotoUpload({
                inputElement: avatarInput,
                maxFiles: 1, // Apenas uma foto
                onFilesSelected: (files) => {
                    if (files.length > 0) {
                        const file = files[0];
                        console.log('🖼️ Arquivo selecionado:', file.name);
                        
                        // Criar preview imediato
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            profileAvatar.src = e.target.result;
                            this.salvarFotoPerfil(file);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            });
        }
    }

    // ✅ SALVAR FOTO DE PERFIL NO SERVIDOR
    async salvarFotoPerfil(file) {
        try {
            console.log('💾 Salvando foto de perfil...');
            
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${this.baseUrl}/backend/api/upload_avatar.php`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();
            console.log('📊 Resultado do upload:', result);
            
            if (result.success) {
                showMessage('✅ Foto de perfil atualizada com sucesso!', 'success');
                
                // ✅ ATUALIZAR AVATAR NO HEADER TAMBÉM
                this.userData.avatar_url = result.avatar_url;
                AuthService.updateUserData(this.userData);
                this.atualizarHeader();
                
            } else {
                showMessage('❌ Erro ao salvar foto: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('💥 Erro ao salvar foto:', error);
            showMessage('❌ Erro ao salvar foto de perfil.', 'error');
        }
    }

    // ✅ CONFIGURAR FORMULÁRIO PRINCIPAL
    configurarFormulario() {
        const form = document.querySelector('.profile-form');
        
        console.log('📝 Configurando formulário...');
        
        // Evento de submit do formulário
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📤 Formulário submetido...');
            await this.salvarAlteracoes();
        });

        // ✅ MÁSCARA DE TELEFONE
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', this.aplicarMascaraTelefone);
        }
    }

    // ✅ APLICAR MÁSCARA DE TELEFONE
    aplicarMascaraTelefone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        e.target.value = value;
    }

    // ✅ FORMATAR TELEFONE PARA EXIBIÇÃO
    formatarTelefone(telefone) {
        if (!telefone) return '';
        
        const numbers = telefone.replace(/\D/g, '');
        
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
    }

    // ✅ SALVAR ALTERAÇÕES NO PERFIL
    async salvarAlteracoes() {
        const saveBtn = document.getElementById('saveBtn');
        
        // Mostrar loading no botão
        setButtonLoading(saveBtn, true);
        console.log('💾 Iniciando salvamento das alterações...');

        try {
            // ✅ DADOS BÁSICOS DO FORMULÁRIO
            const formData = {
                nome_completo: document.getElementById('nome').value.trim(),
                email: document.getElementById('email').value.trim()
            };

            console.log('📝 Dados básicos:', formData);

            // ✅ TELEFONE (APENAS SE PREENCHIDO)
            const telefoneInput = document.getElementById('telefone').value.trim();
            if (telefoneInput) {
                formData.telefone = telefoneInput.replace(/\D/g, ''); // Apenas números
                console.log('📞 Telefone processado:', formData.telefone);
            }

            // ✅ VALIDAÇÕES BÁSICAS
            if (!formData.nome_completo || !formData.email) {
                throw new Error('❌ Nome e email são obrigatórios.');
            }

            if (!this.validarEmail(formData.email)) {
                throw new Error('❌ Por favor, insira um email válido.');
            }

            // ✅ VALIDAÇÃO DE SENHA (VERSÃO CORRIGIDA)
            const senhaAtual = document.getElementById('senha-atual').value;
            const novaSenha = document.getElementById('nova-senha').value;

            if (senhaAtual || novaSenha) {
                console.log('🔐 Processando alteração de senha...');
                
                if (!senhaAtual || !novaSenha) {
                    throw new Error('❌ Para alterar a senha, preencha ambos os campos.');
                }

                if (novaSenha.length < 6) {
                    throw new Error('❌ A nova senha deve ter pelo menos 6 caracteres.');
                }

                // ✅ VERIFICAR SENHA ATUAL PRIMEIRO
                console.log('🔑 Verificando senha atual...');
                const senhaValida = await this.verificarSenhaAtual(senhaAtual);
                
                if (!senhaValida) {
                    // ✅ LOG DETALHADO PARA DEBUG
                    console.error('❌ Senha atual inválida no verify_password.php');
                    console.error('🔍 Senha testada:', senhaAtual);
                    console.error('🔍 User ID:', this.userData.id);
                    
                    throw new Error('❌ A senha atual está incorreta.');
                }

                console.log('✅ Senha atual validada com sucesso!');
                
                // ✅ ADICIONAR CAMPOS DE SENHA AO FORM DATA
                formData.senha_atual = senhaAtual;
                formData.nova_senha = novaSenha;
            }

            // ✅ ENVIAR DADOS PARA ATUALIZAÇÃO
            console.log('📤 Enviando dados para o servidor...');
            await this.atualizarDadosUsuario(formData);

        } catch (error) {
            console.error('❌ Erro ao salvar alterações:', error);
            showMessage(error.message, 'error');
        } finally {
            // Restaurar botão
            setButtonLoading(saveBtn, false);
            console.log('🏁 Processo de salvamento finalizado');
        }
    }

    // ✅ VERIFICAR SENHA ATUAL NO SERVIDOR
    async verificarSenhaAtual(senhaAtual) {
        try {
            console.log('🔐 Verificando senha atual no servidor...');
            
            const response = await fetch(`${this.baseUrl}/backend/api/verify_password.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senha_atual: senhaAtual
                }),
                credentials: 'include'
            });

            const result = await response.json();
            console.log('📊 Resultado da verificação:', result);
            
            return result.success;
            
        } catch (error) {
            console.error('💥 Erro ao verificar senha:', error);
            return false;
        }
    }

    // ✅ VALIDAR FORMATO DE EMAIL
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // ✅ ATUALIZAR DADOS DO USUÁRIO NO SERVIDOR
 async atualizarDadosUsuario(dados) {
        try {
            const url = `${this.baseUrl}/backend/api/update_user.php`;
            
            console.log('📤 Enviando para:', url);
            console.log('📝 Dados enviados:', dados);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
                credentials: 'include'
            });

            const text = await response.text();
            console.log('📥 Resposta bruta:', text);
            
            // ✅ VERIFICAR SE A RESPOSTA É HTML (ERRO 404)
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                throw new Error('❌ Arquivo PHP não encontrado (404)');
            }
            
            const result = JSON.parse(text);
            console.log('📊 Resultado parseado:', result);

            if (result.success) {
                showMessage('✅ Dados atualizados com sucesso!', 'success');
                
                // ✅ ATUALIZAR DADOS LOCAIS
                this.userData.nome_completo = dados.nome_completo;
                this.userData.email = dados.email;
                if (dados.telefone) {
                    this.userData.telefone = dados.telefone;
                }
                
                // ✅ ATUALIZAR NO LOCALSTORAGE
                AuthService.updateUserData(this.userData);
                
                // ✅ ATUALIZAR HEADER EM TODAS AS PÁGINAS
                this.atualizarHeader();
                
                // ✅ RECARREGAR DADOS COMPLETOS
                this.carregarDadosCompletos();
                
                // ✅ LIMPAR CAMPOS DE SENHA
                document.getElementById('senha-atual').value = '';
                document.getElementById('nova-senha').value = '';
                
                console.log('✅ Dados atualizados com sucesso no frontend');
                
            } else {
                throw new Error('❌ Erro ao atualizar dados: ' + (result.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            throw new Error('❌ Erro de conexão ao atualizar dados: ' + error.message);
        }
    }

    // ✅ ATUALIZAR HEADER EM TODAS AS PÁGINAS (VERSÃO CORRIGIDA)
    atualizarHeader() {
        console.log('🔄 Atualizando header em todas as páginas...');
        
        // ✅ ATUALIZAR LOCALSTORAGE PRIMEIRO
        AuthService.updateUserData(this.userData);
        
        // ✅ USAR AdminComponents SE DISPONÍVEL
        if (window.AdminComponents && typeof window.AdminComponents.updateHeaderInfo === 'function') {
            window.AdminComponents.updateHeaderInfo();
            console.log('✅ Header atualizado via AdminComponents');
        } else {
            // ✅ FALLBACK: ATUALIZAR MANUALMENTE
            console.log('🔄 Usando fallback para atualizar header');
            const userData = AuthService.getUserData();
            if (userData) {
                // ✅ ATUALIZAR NOME
                const adminNameElement = document.getElementById('adminName');
                if (adminNameElement) {
                    adminNameElement.innerHTML = `${userData.nome_completo} <i class="fas fa-chevron-down"></i>`;
                }
                
                // ✅ ATUALIZAR AVATAR COM VERIFICAÇÃO
                const headerAvatar = document.getElementById('headerAvatar');
                if (headerAvatar && userData.avatar_url) {
                    const testImg = new Image();
                    testImg.onload = () => {
                        headerAvatar.src = userData.avatar_url;
                        console.log('✅ Avatar do header atualizado:', userData.avatar_url);
                    };
                    testImg.onerror = () => {
                        console.warn('❌ Erro ao carregar avatar no header, usando fallback');
                        headerAvatar.src = '../../img/avatars/default-avatar.jpg';
                    };
                    testImg.src = userData.avatar_url;
                }
            }
        }
        
        // ✅ FORÇAR SINCRONIZAÇÃO COM API
        if (window.AdminComponents && typeof window.AdminComponents.syncUserDataWithAPI === 'function') {
            setTimeout(() => {
                window.AdminComponents.syncUserDataWithAPI();
            }, 500);
        }
    }
    // =============================================
    // ✅ SEÇÃO DE DEBUG - FERRAMENTAS DE DESENVOLVIMENTO
    // =============================================

    // ✅ CONFIGURAR BOTÕES DE DEBUG
//     configurarDebug() {
//         console.log('🐛 Configurando ferramentas de debug...');
        
//         // Botão para ver dados completos
//         document.getElementById('debugVerDados').addEventListener('click', () => {
//             this.debugVerDadosCompletos();
//         });
        
//         // Botão para ver sessão
//         document.getElementById('debugVerSessao').addEventListener('click', () => {
//             this.debugVerSessao();
//         });
        
//         // Botão para testar senha
//         document.getElementById('debugTestarSenha').addEventListener('click', () => {
//             this.debugTestarSenha();
//         });
        
//         // Botão para testar fluxo completo
//         document.getElementById('debugTestarFluxo').addEventListener('click', () => {
//             this.debugFluxoAtualizacao();
//         });
        
//         // Botão para resetar senha
//         document.getElementById('debugResetSenha').addEventListener('click', () => {
//             this.debugResetarSenha();
//         });
        
//         // Botão de emergência
//         document.getElementById('debugEmergencyFix').addEventListener('click', () => {
//             this.debugEmergencyFix();
//         });
        
//         // Preencher informações de debug
//         this.preencherInfoDebug();
//     }

//     // ✅ PREENCHER INFORMAÇÕES DE DEBUG
//     preencherInfoDebug() {
//         document.getElementById('debugUserId').value = this.userData?.id || 'N/A';
        
//         // Tentar obter o hash da senha via API
//         this.obterHashSenha();
//     }

//     // ✅ OBTER HASH DA SENHA DO BANCO
//     async obterHashSenha() {
//         try {
//             const response = await fetch(`${this.baseUrl}/backend/api/debug_get_user.php`, {
//                 method: 'GET',
//                 credentials: 'include'
//             });
            
//             if (response.ok) {
//                 const result = await response.json();
//                 if (result.success && result.data.senha_hash) {
//                     document.getElementById('debugSenhaHash').value = result.data.senha_hash;
//                     this.debugLog(`✅ Hash da senha obtido: ${result.data.senha_hash.substring(0, 20)}...`);
//                 }
//             }
//         } catch (error) {
//             this.debugLog(`❌ Erro ao obter hash: ${error.message}`);
//         }
//     }

//     // ✅ VER DADOS COMPLETOS DO USUÁRIO
//     async debugVerDadosCompletos() {
//         try {
//             this.debugLog('📊 Buscando dados completos do usuário...');
            
//             const response = await fetch(`${this.baseUrl}/backend/api/get_user.php`, {
//                 method: 'GET',
//                 credentials: 'include'
//             });
            
//             const text = await response.text();
//             this.debugLog('📥 Resposta bruta: ' + text.substring(0, 200) + '...');
            
//             const result = JSON.parse(text);
//             this.debugLog('🔍 Dados completos: ' + JSON.stringify(result, null, 2));
            
//         } catch (error) {
//             this.debugLog(`💥 Erro: ${error.message}`);
//         }
//     }

//     // ✅ VER DADOS DA SESSÃO
//     debugVerSessao() {
//         this.debugLog('🔐 Dados da sessão/localStorage:');
//         this.debugLog('📍 user_id: ' + (this.userData?.id || 'N/A'));
//         this.debugLog('📍 nome_completo: ' + (this.userData?.nome_completo || 'N/A'));
//         this.debugLog('📍 email: ' + (this.userData?.email || 'N/A'));
//         this.debugLog('📍 tipo_usuario: ' + (this.userData?.tipo_usuario || 'N/A'));
        
//         // Verificar token no localStorage
//         const token = localStorage.getItem('user_token');
//         this.debugLog('📍 user_token: ' + (token ? 'EXISTE' : 'NÃO EXISTE'));
        
//         // Verificar sessão PHP via API
//         this.verificarSessaoPHP();
//     }

//     // ✅ VERIFICAR SESSÃO PHP
//     async verificarSessaoPHP() {
//         try {
//             const response = await fetch(`${this.baseUrl}/backend/api/check_session.php`, {
//                 credentials: 'include'
//             });
            
//             if (response.ok) {
//                 const result = await response.json();
//                 this.debugLog('🐘 Sessão PHP: ' + JSON.stringify(result));
//             } else {
//                 this.debugLog('❌ Erro ao verificar sessão PHP');
//             }
//         } catch (error) {
//             this.debugLog(`💥 Erro sessão PHP: ${error.message}`);
//         }
//     }

//     // ✅ TESTAR SENHA MANUALMENTE
//     async debugTestarSenha() {
//         const senhaTeste = document.getElementById('debugSenhaTeste').value;
        
//         if (!senhaTeste) {
//             this.debugLog('❌ Digite uma senha para testar');
//             return;
//         }
        
//         this.debugLog(`🔐 Testando senha: "${senhaTeste}"`);
        
//         try {
//             const senhaValida = await this.verificarSenhaAtual(senhaTeste);
            
//             if (senhaValida) {
//                 this.debugLog('✅ SENHA CORRETA! O problema está no frontend.');
//             } else {
//                 this.debugLog('❌ SENHA INCORRETA! O problema está na senha ou no hash.');
//             }
            
//         } catch (error) {
//             this.debugLog(`💥 Erro no teste: ${error.message}`);
//         }
//     }

//     // ✅ DEBUG DO FLUXO COMPLETO DE ATUALIZAÇÃO
//     async debugFluxoAtualizacao() {
//         this.debugLog('🔄 INICIANDO DEBUG DO FLUXO DE ATUALIZAÇÃO...');
        
//         const senhaTeste = 'password';
//         const dadosTeste = {
//             nome_completo: this.userData.nome_completo,
//             email: this.userData.email,
//             telefone: this.userData.telefone,
//             senha_atual: senhaTeste,
//             nova_senha: 'newpassword123'
//         };

//         try {
//             // Passo 1: Testar verify_password.php
//             this.debugLog('1. Testando verify_password.php...');
//             const verifyResponse = await fetch(`${this.baseUrl}/backend/api/verify_password.php`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ senha_atual: senhaTeste }),
//                 credentials: 'include'
//             });
            
//             const verifyResult = await verifyResponse.json();
//             this.debugLog(`   verify_password: ${JSON.stringify(verifyResult)}`);

//             // Passo 2: Testar update_user.php
//             this.debugLog('2. Testando update_user.php...');
//             const updateResponse = await fetch(`${this.baseUrl}/backend/api/update_user.php`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(dadosTeste),
//                 credentials: 'include'
//             });
            
//             const updateResult = await updateResponse.json();
//             this.debugLog(`   update_user: ${JSON.stringify(updateResult)}`);

//             // Passo 3: Analisar resultados
//             if (verifyResult.success && updateResult.success) {
//                 this.debugLog('✅ FLUXO COMPLETO FUNCIONANDO!');
//             } else {
//                 this.debugLog('❌ PROBLEMA IDENTIFICADO:');
//                 if (!verifyResult.success) {
//                     this.debugLog('   - verify_password.php está falhando');
//                 }
//                 if (!updateResult.success) {
//                     this.debugLog('   - update_user.php está falhando');
//                 }
//             }

//         } catch (error) {
//             this.debugLog(`💥 Erro no fluxo: ${error.message}`);
//         }
//     }

//     // ✅ RESETAR SENHA PARA "password"
//     async debugResetarSenha() {
//         if (!confirm('⚠️ TEM CERTEZA? Isso irá resetar sua senha para "password".')) {
//             return;
//         }
        
//         this.debugLog('🔄 Resetando senha para "password"...');
        
//         try {
//             const response = await fetch(`${this.baseUrl}/backend/api/debug_reset_password.php`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     nova_senha: 'password'
//                 }),
//                 credentials: 'include'
//             });
            
//             const result = await response.json();
            
//             if (result.success) {
//                 this.debugLog('✅ Senha resetada para "password" com sucesso!');
//                 this.debugLog('🔑 Agora você pode usar a senha: password');
//             } else {
//                 this.debugLog(`❌ Erro ao resetar: ${result.message}`);
//             }
            
//         } catch (error) {
//             this.debugLog(`💥 Erro: ${error.message}`);
//         }
//     }

//     // ✅ CORREÇÃO DE EMERGÊNCIA - TESTE DIRETO NO BANCO
//     async debugEmergencyFix() {
//         this.debugLog('🚨 INICIANDO CORREÇÃO DE EMERGÊNCIA...');
        
//         try {
//             // Teste 1: Verificar conexão com o banco
//             this.debugLog('1. Testando conexão com banco...');
//             const testResponse = await fetch(`${this.baseUrl}/backend/api/debug_test_password.php?senha=password`, {
//                 credentials: 'include'
//             });
            
//             const testResult = await testResponse.json();
//             this.debugLog(`2. Resultado do teste: ${JSON.stringify(testResult)}`);
            
//             if (testResult.success) {
//                 this.debugLog('✅ PROBLEMA IDENTIFICADO: verify_password.php com erro');
//                 this.debugLog('🎯 SOLUÇÃO: Use o botão "Resetar para password" abaixo');
//             } else {
//                 this.debugLog(`❌ Erro no teste: ${testResult.message}`);
//             }
            
//         } catch (error) {
//             this.debugLog(`💥 Erro na correção: ${error.message}`);
//         }
//     }

//     // ✅ ADICIONAR LOG NO PAINEL DE DEBUG
//     debugLog(mensagem) {
//         const logsDiv = document.getElementById('debugLogs');
//         const logsContent = document.getElementById('debugLogsContent');
        
//         const timestamp = new Date().toLocaleTimeString();
//         const logEntry = document.createElement('div');
//         logEntry.innerHTML = `<span style="color: #666;">[${timestamp}]</span> ${mensagem}`;
        
//         logsContent.appendChild(logEntry);
//         logsDiv.style.display = 'block';
        
//         // Auto-scroll para o final
//         logsDiv.scrollTop = logsDiv.scrollHeight;
        
//         console.log(`🐛 DEBUG: ${mensagem}`);
//     }
}

// ✅ INICIALIZAR QUANDO O DOM ESTIVER CARREGADO
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - inicializando PerfilAdmin...');
    new PerfilAdmin();
});