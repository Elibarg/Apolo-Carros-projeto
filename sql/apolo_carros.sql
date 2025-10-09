-- Database: apolo_carros
CREATE DATABASE IF NOT EXISTS apolo_carros;
USE apolo_carros;

-- Tabela de usuários ATUALIZADA
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(15),
    genero ENUM('male', 'female', 'other'),
    data_nascimento DATE,
    cep VARCHAR(9),
    estado VARCHAR(2),
    cidade VARCHAR(50),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    tipo ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de sessões/tokens
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INSERIR USUÁRIO ADMIN INICIAL
INSERT INTO users (
    nome_completo, 
    email, 
    senha, 
    cpf, 
    telefone, 
    tipo
) VALUES (
    'Administrador', 
    'admin@apolocarros.com.br', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    '123.456.789-00', 
    '(11) 99999-9999', 
    'admin'
);