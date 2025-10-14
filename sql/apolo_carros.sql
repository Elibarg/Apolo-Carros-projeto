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

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    km INT NOT NULL,
    color VARCHAR(30) NOT NULL,
    fuel_type ENUM('gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid') NOT NULL,
    transmission ENUM('manual', 'automatic') NOT NULL,
    description TEXT,
    state VARCHAR(2) NOT NULL,
    city VARCHAR(50) NOT NULL,
    status ENUM('active', 'sold', 'inactive') DEFAULT 'active',
    main_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de imagens dos veículos
CREATE TABLE IF NOT EXISTS vehicle_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    image_path VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    vehicle_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, vehicle_id)
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    subject VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'answered', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Inserir alguns veículos de exemplo
INSERT INTO vehicles (user_id, brand, model, year, price, km, color, fuel_type, transmission, description, state, city, main_image) VALUES
(1, 'Chevrolet', 'Onix', 2021, 95000.00, 45000, 'Vermelho', 'flex', 'automatic', 'Carro em excelente estado, único dono, completo.', 'SP', 'São Paulo', '../img/Chevrolet_Onix.png'),
(1, 'Volkswagen', 'Golf', 2020, 120000.00, 30000, 'Preto', 'gasoline', 'automatic', 'Carro importado, manutenção em concessionária.', 'SP', 'São Paulo', '../img/Chevrolet_Onix.png'),
(1, 'Fiat', 'Mobi', 2022, 55000.00, 15000, 'Branco', 'flex', 'manual', 'Carro novo, econômico, perfeito para cidade.', 'RJ', 'Rio de Janeiro', '../img/Chevrolet_Onix.png');

-- Inserir alguns contatos de exemplo
INSERT INTO contacts (name, email, phone, subject, message) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'Dúvida sobre financiamento', 'Gostaria de saber mais sobre as condições de financiamento.'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Informações sobre veículo', 'O carro Chevrolet Onix ainda está disponível?');