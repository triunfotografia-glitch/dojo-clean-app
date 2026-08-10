-- ============================================================
-- DOJO LB — PostgreSQL Schema (v2.1)
-- Melhorias: triggers, enums, constraints, índices extras
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE status_cobranca AS ENUM ('pendente', 'pago', 'atrasado');
CREATE TYPE status_presenca AS ENUM ('presente', 'falta', 'justificado');

-- ============================================================
-- TRIGGER FUNCTION (updated_at automático)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELA: professores
-- ============================================================
CREATE TABLE IF NOT EXISTS professores (
    id              SERIAL PRIMARY KEY,
    nome            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    senha           TEXT NOT NULL CHECK (length(senha) >= 60),
    telefone        TEXT,
    faixa           TEXT,
    graus           INTEGER DEFAULT 0,
    especialidade   TEXT,
    ativo           BOOLEAN DEFAULT TRUE,
    aluno_id        INTEGER REFERENCES alunos(id) ON DELETE SET NULL,
    criado_em       TIMESTAMP DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: alunos
-- ============================================================
CREATE TABLE IF NOT EXISTS alunos (
    id                  SERIAL PRIMARY KEY,
    nome                TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    telefone            TEXT,
    senha               TEXT NOT NULL CHECK (length(senha) >= 60),
    foto                TEXT,
    data_nascimento     DATE,
    faixa               TEXT,
    graus               INTEGER DEFAULT 0,
    historico_graduacao JSONB DEFAULT '[]'::jsonb,
    turma               TEXT,
    professor_id        INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    data_entrada        TIMESTAMP,
    ativo               BOOLEAN DEFAULT TRUE,
    mensalidade         TEXT,
    valor_mensalidade   NUMERIC(10,2) DEFAULT 0,
    dia_vencimento      INTEGER DEFAULT 10 CHECK (dia_vencimento BETWEEN 1 AND 31),
    proxima_cobranca    DATE,
    observacao          TEXT,
    criado_em           TIMESTAMP DEFAULT NOW(),
    atualizado_em       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: turmas
-- ============================================================
CREATE TABLE IF NOT EXISTS turmas (
    id              SERIAL PRIMARY KEY,
    nome            TEXT NOT NULL,
    professor       TEXT,
    professor_id    INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    alunos          JSONB DEFAULT '[]'::jsonb,
    criado_em       TIMESTAMP DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: turma_alunos
-- ============================================================
CREATE TABLE IF NOT EXISTS turma_alunos (
    id          SERIAL PRIMARY KEY,
    turma_id    INTEGER NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    aluno_id    INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    UNIQUE(turma_id, aluno_id)
);

-- ============================================================
-- TABELA: treinos
-- ============================================================
CREATE TABLE IF NOT EXISTS treinos (
    id              SERIAL PRIMARY KEY,
    nome            TEXT NOT NULL,
    dia             TEXT,
    horario         TEXT,
    turma           TEXT,
    turma_id        INTEGER REFERENCES turmas(id) ON DELETE SET NULL,
    professor       TEXT,
    professor_id    INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    criado_em       TIMESTAMP DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: presencas
-- ============================================================
CREATE TABLE IF NOT EXISTS presencas (
    id              SERIAL PRIMARY KEY,
    aluno_id        INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    treino_id       INTEGER NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
    data            DATE NOT NULL,
    status          status_presenca NOT NULL,
    criado_em       TIMESTAMP DEFAULT NOW(),
    UNIQUE(aluno_id, treino_id, data)
);

-- ============================================================
-- TABELA: graduacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS graduacoes (
    id              SERIAL PRIMARY KEY,
    aluno_id        INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    faixa           TEXT NOT NULL,
    data            DATE NOT NULL,
    professor       TEXT,
    observacao      TEXT,
    criado_em       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: cobrancas
-- ============================================================
CREATE TABLE IF NOT EXISTS cobrancas (
    id              SERIAL PRIMARY KEY,
    aluno_id        INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    descricao       TEXT,
    valor           NUMERIC(10,2) NOT NULL,
    vencimento      DATE NOT NULL,
    competencia     TEXT,
    status          status_cobranca DEFAULT 'pendente',
    pago_em         TIMESTAMP,
    forma_pagamento TEXT,
    observacao      TEXT,
    criado_em       TIMESTAMP DEFAULT NOW(),
    atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABELA: pix_config
-- ============================================================
CREATE TABLE IF NOT EXISTS pix_config (
    id                  SERIAL PRIMARY KEY,
    chave_pix           TEXT NOT NULL,
    nome_recebedor      TEXT NOT NULL DEFAULT 'DOJO LB',
    cidade_recebedor    TEXT NOT NULL DEFAULT 'SAO PAULO',
    criado_em           TIMESTAMP DEFAULT NOW(),
    atualizado_em       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE TRIGGER trg_alunos_updated
BEFORE UPDATE ON alunos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_professores_updated
BEFORE UPDATE ON professores
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_turmas_updated
BEFORE UPDATE ON turmas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_treinos_updated
BEFORE UPDATE ON treinos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cobrancas_updated
BEFORE UPDATE ON cobrancas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pix_updated
BEFORE UPDATE ON pix_config
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ÍNDICES
-- ============================================================

-- alunos
CREATE INDEX idx_alunos_professor_id ON alunos(professor_id);
CREATE INDEX idx_alunos_turma ON alunos(turma);
CREATE INDEX idx_alunos_ativo ON alunos(ativo);
CREATE INDEX idx_alunos_proxima_cobranca ON alunos(proxima_cobranca);

-- professores
CREATE INDEX idx_professores_aluno_id ON professores(aluno_id);

-- turmas
CREATE INDEX idx_turmas_professor_id ON turmas(professor_id);

-- turma_alunos
CREATE INDEX idx_turma_alunos_turma_id ON turma_alunos(turma_id);
CREATE INDEX idx_turma_alunos_aluno_id ON turma_alunos(aluno_id);

-- treinos
CREATE INDEX idx_treinos_turma_id ON treinos(turma_id);
CREATE INDEX idx_treinos_professor_id ON treinos(professor_id);

-- presencas
CREATE INDEX idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX idx_presencas_treino_id ON presencas(treino_id);
CREATE INDEX idx_presencas_data ON presencas(data);

-- graduacoes
CREATE INDEX idx_graduacoes_aluno_id ON graduacoes(aluno_id);

-- cobrancas
CREATE INDEX idx_cobrancas_aluno_id ON cobrancas(aluno_id);
CREATE INDEX idx_cobrancas_status ON cobrancas(status);
CREATE INDEX idx_cobrancas_vencimento ON cobrancas(vencimento);
CREATE INDEX idx_cobrancas_competencia ON cobrancas(competencia);
CREATE INDEX idx_cobrancas_aluno_status ON cobrancas(aluno_id, status);