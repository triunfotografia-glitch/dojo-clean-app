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
          AND conrelid = 'public.presencas'::regclass
    ) THEN
        ALTER TABLE public.presencas
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
          AND conrelid = 'public.presencas'::regclass
    ) THEN
        ALTER TABLE public.presencas
        ADD CONSTRAINT presencas_treino_id_fkey
        FOREIGN KEY (treino_id)
        REFERENCES public.treinos(id);
    END IF;
END
$$;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Execute estas queries para verificar se a migração foi aplicada:

-- Verificar se a constraint foi removida:
-- SELECT conname, confdeltype
-- FROM pg_constraint
-- WHERE conname = 'presencas_treino_id_fkey';
-- confdeltype deve ser 'a' (NO ACTION) em vez de 'c' (CASCADE)
