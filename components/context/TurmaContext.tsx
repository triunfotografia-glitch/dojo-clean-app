import {
  deleteTurma,
  getToken,
  getTurmas,
  onAuthLost,
  postTurma,
  updateTurma,
} from '@/services/api';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface Turma {
  id: string;
  nome: string;
  professorId: string;
  alunoIds: string[];
}

interface TurmaContextData {
  turmas: Turma[];
  adicionarTurma: (turma: Omit<Turma, 'id'>) => Promise<Turma>;
  excluirTurma: (id: string) => Promise<void>;
  atualizarTurma: (
    id: string,
    turma: Omit<Turma, 'id'>
  ) => Promise<Turma>;
}

const TurmaContext =
  createContext<TurmaContextData>(
    {} as TurmaContextData
  );

function normalizarTurma(turma: any): Turma {
  return {
    id: String(turma.id),
    nome: String(turma.nome ?? ''),
    professorId: String(
      turma.professor_id ??
        turma.professorId ??
        ''
    ),
    alunoIds: Array.isArray(turma.alunoIds)
      ? turma.alunoIds.map((id: any) => String(id))
      : Array.isArray(turma.aluno_ids)
        ? turma.aluno_ids.map((id: any) => String(id))
        : Array.isArray(turma.turma_alunos)
          ? turma.turma_alunos
              .map((item: any) => String(item.aluno_id ?? item.alunoId ?? item.id ?? ''))
              .filter((id: string) => id !== '')
          : Array.isArray(turma.alunos)
            ? turma.alunos.map((id: any) => String(id))
            : [],
  };
}

export function TurmaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [turmas, setTurmas] =
    useState<Turma[]>([]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const token = await getToken();

      if (!token || !ativo) {
        return;
      }

      try {
        const dados = await getTurmas();

        if (!ativo) return;

        setTurmas(
          Array.isArray(dados)
            ? dados.map(normalizarTurma)
            : []
        );
      } catch (error) {
        console.error(
          'Erro ao carregar turmas:',
          error
        );
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  // ==============================
  // AUTH LOSS LISTENER
  // ==============================

  useEffect(() => {
    const cleanup = onAuthLost(() => {
      setTurmas([]);
    });

    return cleanup;
  }, []);

  async function adicionarTurma(
    turma: Omit<Turma, 'id'>
  ): Promise<Turma> {
    try {
      const criada = await postTurma({
        nome: turma.nome,
        professorId:
          turma.professorId || '',
        alunoIds: turma.alunoIds || [],
      });

      const turmaNormalizada =
        normalizarTurma(criada);

      setTurmas((lista) => [
        turmaNormalizada,
        ...lista,
      ]);

      return turmaNormalizada;
    } catch (error) {
      console.error(
        'Erro ao adicionar turma:',
        error
      );

      throw error;
    }
  }

  async function atualizarTurma(
    id: string,
    turma: Omit<Turma, 'id'>
  ): Promise<Turma> {
    try {
      const atualizada = await updateTurma(id, {
        nome: turma.nome,
        professorId:
          turma.professorId || '',
        alunoIds: turma.alunoIds || [],
      });

      const turmaNormalizada =
        normalizarTurma(atualizada);

      setTurmas((lista) =>
        lista.map((item) =>
          String(item.id) === String(id)
            ? turmaNormalizada
            : item
        )
      );

      return turmaNormalizada;
    } catch (error) {
      console.error(
        'Erro ao atualizar turma:',
        error
      );

      throw error;
    }
  }
  async function excluirTurma(
    id: string
  ): Promise<void> {
    try {
      await deleteTurma(id);

      setTurmas((lista) =>
        lista.filter(
          (turma) =>
            String(turma.id) !== String(id)
        )
      );
    } catch (error) {
      console.error(
        'Erro ao excluir turma:',
        error
      );

      throw error;
    }
  }

  return (
    <TurmaContext.Provider
      value={{
        turmas,
        adicionarTurma,
        excluirTurma,
      atualizarTurma,
      }}
    >
      {children}
    </TurmaContext.Provider>
  );
}

export function useTurmas() {
  return useContext(TurmaContext);
}