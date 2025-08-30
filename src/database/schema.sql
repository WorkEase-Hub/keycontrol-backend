-- KeyControl Manager Database Schema
-- Autor: Adimael Santos da Silva - github.com/adimael
-- Versão: 2.2.1

-- Configurações do banco
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS historico_chaves;
DROP TABLE IF EXISTS pessoas;
DROP TABLE IF EXISTS salas;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- Tabela de usuários do sistema
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('funcionario', 'administrador') DEFAULT 'funcionario',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_nivel_acesso (nivel_acesso)
);

-- Tabela de salas
CREATE TABLE salas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    numero VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    disponivel ENUM('Disponível', 'Indisponível', 'Em uso') DEFAULT 'Disponível',
    chave_reserva_disponivel ENUM('Disponível', 'Indisponível', 'Em uso') DEFAULT 'Disponível',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (numero),
    INDEX idx_disponivel (disponivel),
    INDEX idx_status (status)
);

-- Tabela de pessoas (cadastro auxiliar)
CREATE TABLE pessoas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(255) NOT NULL,
    departamento VARCHAR(255),
    cargo VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_departamento (departamento)
);

-- Tabela de histórico de chaves
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
    INDEX idx_sala_id (sala_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_data_retirada (data_retirada),
    INDEX idx_devolvido (devolvido)
);

-- Inserir usuário administrador padrão
INSERT INTO usuarios (id, username, senha, nivel_acesso) VALUES 
('admin-default-001', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeK3WtQV3FdODJWje', 'administrador');
-- Senha padrão: 'admin123' (ALTERAR EM PRODUÇÃO!)

-- Inserir salas de exemplo
INSERT INTO salas (id, numero, nome, observacoes) VALUES 
('sala-001', '101', 'Sala de Reuniões A', 'Sala principal para reuniões'),
('sala-002', '102', 'Laboratório de Informática', 'Sala com computadores'),
('sala-003', '103', 'Auditório', 'Sala para eventos grandes'),
('sala-004', '201', 'Sala de Treinamento', 'Sala para cursos'),
('sala-005', '202', 'Biblioteca', 'Espaço de estudos');

-- Inserir pessoas de exemplo
INSERT INTO pessoas (id, nome, departamento, cargo, email) VALUES 
('pessoa-001', 'João Silva', 'TI', 'Analista', 'joao.silva@empresa.com'),
('pessoa-002', 'Maria Santos', 'RH', 'Gerente', 'maria.santos@empresa.com'),
('pessoa-003', 'Pedro Oliveira', 'Vendas', 'Vendedor', 'pedro.oliveira@empresa.com'),
('pessoa-004', 'Ana Costa', 'Marketing', 'Coordenadora', 'ana.costa@empresa.com');