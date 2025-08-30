-- KeyControl MySQL Database Schema
-- This schema replicates the Supabase database structure for MySQL

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS keycontrol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE keycontrol_db;

-- Drop existing tables if they exist (for fresh installation)
DROP TABLE IF EXISTS historico_chaves;
DROP TABLE IF EXISTS perfis;
DROP TABLE IF EXISTS pessoas;
DROP TABLE IF EXISTS salas;
DROP TABLE IF EXISTS usuarios;

-- Create usuarios (users) table
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('funcionario', 'administrador') NOT NULL DEFAULT 'funcionario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_nivel_acesso (nivel_acesso)
) ENGINE=InnoDB;

-- Create pessoas (people) table
CREATE TABLE pessoas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_completo VARCHAR(255) NOT NULL,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nome_completo (nome_completo)
) ENGINE=InnoDB;

-- Create perfis (profiles) table
CREATE TABLE perfis (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id VARCHAR(36) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    departamento VARCHAR(255),
    cargo VARCHAR(255),
    data_admissao DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Create salas (rooms) table
CREATE TABLE salas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    numero VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    disponivel ENUM('Disponível', 'Indisponível', 'Em uso') NOT NULL DEFAULT 'Disponível',
    chave_reserva_disponivel ENUM('Disponível', 'Indisponível', 'Em uso') NOT NULL DEFAULT 'Disponível',
    status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_numero (numero),
    INDEX idx_status (status),
    INDEX idx_disponivel (disponivel)
) ENGINE=InnoDB;

-- Create historico_chaves (key history) table
CREATE TABLE historico_chaves (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sala_id VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36),
    tipo_chave ENUM('principal', 'reserva') NOT NULL,
    nome_pessoa VARCHAR(255) NOT NULL,
    data_retirada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao TIMESTAMP NULL,
    devolvido BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_sala_id (sala_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_devolvido (devolvido),
    INDEX idx_data_retirada (data_retirada),
    INDEX idx_data_devolucao (data_devolucao)
) ENGINE=InnoDB;

-- Insert default admin user (password: admin)
-- Password hash generated with bcrypt rounds=12
INSERT INTO usuarios (id, username, senha, nivel_acesso) 
VALUES (
    UUID(),
    'admin', 
    '$2a$12$HrJtpMdmwkK3dUCwYc6XO.XTYzjBR3vGdKcP8CI.6nW1.k51iXu0m', 
    'administrador'
) ON DUPLICATE KEY UPDATE 
    senha = VALUES(senha),
    nivel_acesso = VALUES(nivel_acesso),
    atualizado_em = CURRENT_TIMESTAMP;

-- Create admin profile
INSERT INTO perfis (id, usuario_id, nome, sobrenome, email, departamento, cargo)
SELECT 
    UUID(),
    u.id, 
    'Admin', 
    'System', 
    'admin@keycontrol.com', 
    'TI', 
    'Administrador de Sistema'
FROM usuarios u 
WHERE u.username = 'admin'
ON DUPLICATE KEY UPDATE 
    nome = VALUES(nome),
    sobrenome = VALUES(sobrenome),
    email = VALUES(email),
    departamento = VALUES(departamento),
    cargo = VALUES(cargo),
    atualizado_em = CURRENT_TIMESTAMP;

-- Insert sample rooms
INSERT INTO salas (id, numero, nome, status, observacoes) VALUES
(UUID(), '101', 'Sala de Reuniões 1', 'active', 'Primeiro andar, ala leste'),
(UUID(), '102', 'Sala de Reuniões 2', 'active', 'Primeiro andar, ala oeste'),
(UUID(), '201', 'Laboratório de Informática', 'active', 'Segundo andar'),
(UUID(), '301', 'Auditório', 'active', 'Terceiro andar, capacidade 100 pessoas'),
(UUID(), '401', 'Sala de Treinamento', 'active', 'Quarto andar')
ON DUPLICATE KEY UPDATE 
    nome = VALUES(nome),
    status = VALUES(status),
    observacoes = VALUES(observacoes),
    atualizado_em = CURRENT_TIMESTAMP;

-- Create views for easier querying
CREATE OR REPLACE VIEW vw_usuarios_completos AS
SELECT 
    u.id,
    u.username,
    u.nivel_acesso,
    u.criado_em as usuario_criado_em,
    u.atualizado_em as usuario_atualizado_em,
    p.id as perfil_id,
    p.nome,
    p.sobrenome,
    p.email,
    p.telefone,
    p.departamento,
    p.cargo,
    p.data_admissao,
    CONCAT(p.nome, ' ', COALESCE(p.sobrenome, '')) as nome_completo
FROM usuarios u
LEFT JOIN perfis p ON u.id = p.usuario_id;

CREATE OR REPLACE VIEW vw_historico_completo AS
SELECT 
    h.id,
    h.sala_id,
    h.usuario_id,
    h.tipo_chave,
    h.nome_pessoa,
    h.data_retirada,
    h.data_devolucao,
    h.devolvido,
    h.observacoes,
    h.criado_em,
    h.atualizado_em,
    s.numero as sala_numero,
    s.nome as sala_nome,
    u.username,
    CONCAT(p.nome, ' ', COALESCE(p.sobrenome, '')) as usuario_nome_completo
FROM historico_chaves h
JOIN salas s ON h.sala_id = s.id
LEFT JOIN usuarios u ON h.usuario_id = u.id
LEFT JOIN perfis p ON u.id = p.usuario_id;

-- Show database setup completion
SELECT 'Database setup completed successfully!' as message;