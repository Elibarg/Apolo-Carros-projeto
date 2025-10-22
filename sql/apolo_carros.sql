-- =============================================
-- BANCO DE DADOS: Apolo Carros
-- TABELA: usuarios
-- DESCRIÇÃO: Tabela completa de usuários do sistema
-- =============================================

-- Criar o banco de dados se não existir
CREATE DATABASE IF NOT EXISTS apolo_carros;
USE apolo_carros;

-- =============================================
-- CRIAÇÃO DA TABELA USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
    -- Identificação
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados básicos de autenticação
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario',
    
    -- Avatar/Foto de perfil
    avatar_url VARCHAR(255) DEFAULT NULL,
    
    -- Dados pessoais
    data_nascimento DATE,
    genero ENUM('male', 'female', 'other', 'prefer_not_say'),
    cpf VARCHAR(14) UNIQUE,
    
    -- Endereço
    cep VARCHAR(9),
    estado VARCHAR(2),
    cidade VARCHAR(100),
    endereco TEXT,
    
    -- Contato
    telefone VARCHAR(20),
    
    -- Controle do sistema
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo TINYINT(1) DEFAULT 1,
    
    -- Índices para melhor performance
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_estado (estado),
    INDEX idx_tipo_usuario (tipo_usuario),
    INDEX idx_data_cadastro (data_cadastro),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INSERIR DADOS DE EXEMPLO
-- =============================================

-- Usuário Administrador
INSERT INTO usuarios (
    nome_completo, 
    email, 
    senha, 
    tipo_usuario,
    avatar_url,
    data_nascimento,
    genero,
    cpf,
    cep,
    estado,
    cidade,
    endereco,
    telefone
) VALUES (
    'Administrador do Sistema', 
    'admin@apolocarros.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password
    'admin',
    '/Apolo-Carros-projeto/img/avatars/admin-avatar.jpg',
    '1985-03-15',
    'male',
    '123.456.789-00',
    '01234-567',
    'SP',
    'São Paulo',
    'Avenida Paulista, 1000 - Bela Vista',
    '(11) 9999-8888'
);

-- Usuários Comuns
INSERT INTO usuarios (
    nome_completo, 
    email, 
    senha, 
    avatar_url,
    data_nascimento,
    genero,
    cpf,
    cep,
    estado,
    cidade,
    endereco,
    telefone
) VALUES 
(
    'João Silva Santos', 
    'joao.silva@email.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password
    '/Apolo-Carros-projeto/img/avatars/user1.jpg',
    '1990-05-15',
    'male',
    '987.654.321-00',
    '04567-890',
    'SP',
    'São Paulo',
    'Rua Augusta, 500 - Consolação',
    '(11) 98877-6655'
),
(
    'Maria Oliveira Souza', 
    'maria.oliveira@email.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password
    '/Apolo-Carros-projeto/img/avatars/user2.jpg',
    '1988-08-20',
    'female',
    '111.222.333-44',
    '22010-000',
    'RJ',
    'Rio de Janeiro',
    'Avenida Atlântica, 2000 - Copacabana',
    '(21) 97766-5544'
),
(
    'Pedro Costa Lima', 
    'pedro.costa@email.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password
    NULL,
    '1995-12-10',
    'male',
    '555.666.777-88',
    '30110-000',
    'MG',
    'Belo Horizonte',
    'Avenida do Contorno, 3000 - Centro',
    '(31) 96655-4433'
);
-- =============================================
-- FIM DO SCRIPT
-- =============================================