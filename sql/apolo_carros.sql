-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 18/11/2025 às 10:41
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `apolo_carros`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome_completo` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo_usuario` enum('admin','usuario') DEFAULT 'usuario',
  `avatar_url` varchar(255) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `genero` enum('male','female','other','prefer_not_say') DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome_completo`, `email`, `senha`, `tipo_usuario`, `avatar_url`, `data_nascimento`, `genero`, `cpf`, `cep`, `estado`, `cidade`, `endereco`, `telefone`, `data_cadastro`, `data_atualizacao`, `ativo`) VALUES
(1, 'Elga', 'admin@apolocarros.com', '$2y$10$K/ZhmrfYVGpRMunQgbiXse4O230BeMhLyr3tK3EBN5HHUJVhVXR7G', 'admin', '/Apolo-Carros-projeto/img/avatars/avatar_1_1761160008.png', NULL, NULL, '', '', '', '', '', '47992820417', '2025-10-22 18:41:20', '2025-10-23 00:22:08', 1),
(2, 'João Silva Santos', 'joao.silva@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', '/Apolo-Carros-projeto/img/avatars/user1.jpg', '1990-05-15', 'male', '987.654.321-00', '04567-890', 'SP', 'São Paulo', 'Rua Augusta, 500 - Consolação', '(11) 98877-6655', '2025-10-22 18:41:20', '2025-10-22 18:41:20', 1),
(3, 'Maria Oliveira Souza', 'maria.oliveira@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', '/Apolo-Carros-projeto/img/avatars/user2.jpg', '1988-08-20', 'female', '111.222.333-44', '22010-000', 'RJ', 'Rio de Janeiro', 'Avenida Atlântica, 2000 - Copacabana', '(21) 97766-5544', '2025-10-22 18:41:20', '2025-10-22 18:41:20', 1),
(4, 'Pedro Costa Lima', 'pedro.costa@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario', NULL, '1995-12-10', 'male', '555.666.777-88', '30110-000', 'MG', 'Belo Horizonte', 'Avenida do Contorno, 3000 - Centro', '(31) 96655-4433', '2025-10-22 18:41:20', '2025-10-22 18:41:20', 1),
(9, 'GABRIEL ELESBA', 'calagabriel3441@gmail.com', '$2y$10$zd4Drvl4i7LeV.JwwluMk..3Rg8X63UM5WbsaY0pDkESnFIwPsxiG', 'usuario', NULL, '2006-03-22', 'male', '140.574.449-98', '89213-430', 'SC', 'Joinville', 'Rua Bom Retiro', '47992820423', '2025-11-16 21:04:23', '2025-11-16 22:00:00', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `veiculos`
--

CREATE TABLE `veiculos` (
  `id` int(11) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(150) NOT NULL,
  `ano` smallint(6) NOT NULL,
  `km` int(11) DEFAULT 0,
  `preco` decimal(12,2) DEFAULT 0.00,
  `status` enum('available','reserved','sold') DEFAULT 'available',
  `data_compra` date DEFAULT NULL,
  `images` text DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `veiculos`
--

INSERT INTO `veiculos` (`id`, `marca`, `modelo`, `ano`, `km`, `preco`, `status`, `data_compra`, `images`, `descricao`, `data_cadastro`, `data_atualizacao`, `ativo`) VALUES
(1, 'Chevrolet', 'Onix LT', 2021, 95000, 75000.00, 'available', NULL, '[\"/Apolo-Carros-projeto/img/Chevrolet_Onix.png\"]', 'Sedan econômico, revisado.', '2025-11-17 09:40:30', '2025-11-17 09:40:30', 1),
(2, 'Chevrolet', 'h423', 2000, 200, 20000000.00, 'sold', NULL, '[\"\\/Apolo-Carros-projeto\\/img\\/vehicles\\/veh_691aeffd050bc5.33996938.jpg\",\"\\/Apolo-Carros-projeto\\/img\\/vehicles\\/veh_691af37e0dc097.17956944.webp\"]', '', '2025-11-17 09:50:53', '2025-11-17 10:05:50', 1),
(3, 'Sedan X3', 'Sedan X3', 2222, 400, 45000.00, 'reserved', NULL, '[\"\\/Apolo-Carros-projeto\\/img\\/vehicles\\/veh_691af3a942a218.83267900.jpg\",\"\\/Apolo-Carros-projeto\\/img\\/vehicles\\/veh_691af3a94ddb78.87749105.webp\"]', '', '2025-11-17 10:06:33', '2025-11-17 10:06:33', 1);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cpf` (`cpf`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_cpf` (`cpf`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_tipo_usuario` (`tipo_usuario`),
  ADD KEY `idx_data_cadastro` (`data_cadastro`),
  ADD KEY `idx_ativo` (`ativo`);

--
-- Índices de tabela `veiculos`
--
ALTER TABLE `veiculos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_data_cadastro` (`data_cadastro`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `veiculos`
--
ALTER TABLE `veiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
