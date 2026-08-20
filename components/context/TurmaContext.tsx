import {
  deleteTurma,
  getTurmas,
  postTurma,
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
    alunoIds: Array.isArray(turma.alunos)
      ? turma.alunos.map((id: any) => String(id))
      : Array.isArray(turma.aluno_ids)
        ? turma.aluno_ids.map((id: any) => String(id))
        : Array.isArray(turma.alunoIds)
          ? turma.alunoIds.map((id: any) => String(id))
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

  async function adicionarTurma(
    turma: Omit<Turma, 'id'>
  ): Promise<Turma> {
    const criada = await postTurma({
      nome: turma.nome,
      professorId:
        turma.professorId || null,
      alunoIds: turma.alunoIds || [],
    });

    const turmaNormalizada =
      normalizarTurma(criada);

    setTurmas((lista) => [
      turmaNormalizada,
      ...lista,
    ]);

    return turmaNormalizada;
  }

  async function excluirTurma(
    id: string
  ): Promise<void> {
    await deleteTurma(id);

    setTurmas((lista) =>
      lista.filter(
        (turma) =>
          String(turma.id) !== String(id)
      )
    );
  }

  return (
    <TurmaContext.Provider
      value={{
        turmas,
        adicionarTurma,
        excluirTurma,
      }}
    >
      {children}
    </TurmaContext.Provider>
  );
}

export function useTurmas() {
  return useContext(TurmaContext);
}