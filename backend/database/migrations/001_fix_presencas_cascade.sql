-- ============================================================
-- MIGRAÇÃO: Remover ON DELETE CASCADE da tabela presencas
-- ============================================================
-- Problema: Ao excluir um treino, todas as presenças associadas
--          eram automaticamente apagadas, destruindo o histórico
--          de frequência dos alunos.
--
-- Solução: Remover o ON DELETE CASCADE do campo treino_id e
--          adicionar verificação manual no backend.
-- ============================================================

-- 1. Remover o ON DELETE CASCADE do campo treino_id na tabela presencas
-- Isso impede que presenças sejam apagadas automaticamente ao excluir um treino.

-- Primeiro, dropar a constraint existente
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'presencas_treino_id_fkey'
          AND conrelid = 'presencas'::regclass
    ) THEN
        ALTER TABLE presencas
        DROP CONSTRAINT presencas_treino_id_fkey;
    END IF;
END
$$;

-- Recriar a constraint sem o ON DELETE CASCADE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'presencas_treino_id_fkey'
          AND conrelid = 'presencas'::regclass
    ) THEN
        ALTER TABLE presencas
        ADD CONSTRAINT presencas_treino_id_fkey
        FOREIGN KEY (treino_id)
        REFERENCES treinos(id);
    END IF;
END
$$;

-- 2. Criar tabela chamadas se não existir
CREATE TABLE IF NOT EXISTS chamadas (
    id              SERIAL PRIMARY KEY,
    treino_id       INTEGER NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
    data            DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'encerrada')),
    professor_id    INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    aberta_em       TIMESTAMP DEFAULT NOW(),
    encerrada_em    TIMESTAMP,
    encerrada_por   INTEGER REFERENCES professores(id) ON DELETE SET NULL,
    UNIQUE(treino_id, data)
);

-- 3. Criar índices para a tabela chamadas
CREATE INDEX IF NOT EXISTS idx_chamadas_treino_id ON chamadas(treino_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_data ON chamadas(data);
CREATE INDEX IF NOT EXISTS idx_chamadas_status ON chamadas(status);

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Execute estas queries para verificar se a migração foi aplicada:

-- Verificar se a constraint foi removida:
-- SELECT conname, confdeltype
-- FROM pg_constraint
-- WHERE conname = 'presencas_treino_id_fkey';
-- confdeltype deve ser 'a' (NO ACTION) em vez de 'c' (CASCADE)

-- Verificar se a tabela chamadas existe:
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'chamadas';
