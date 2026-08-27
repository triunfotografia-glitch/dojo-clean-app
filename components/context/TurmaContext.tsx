import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  deleteTurma,
  getToken,
  getTurmas,
  onAuthLost,
  onAuthChanged,
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

const TURMAS_STORAGE_KEY = '@dojo_lb:turmas';

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
  logout: () => Promise<void>;
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

        const normalizadas = Array.isArray(dados)
          ? dados.map(normalizarTurma)
          : [];

        setTurmas(normalizadas);

        try {
          await AsyncStorage.setItem(
            TURMAS_STORAGE_KEY,
            JSON.stringify(normalizadas)
          );
        } catch (error) {
          console.warn(
            'Erro ao salvar turmas localmente:',
            error
          );
        }
      } catch (error) {
        console.error(
          'Erro ao carregar turmas:',
          error
        );

        if (!ativo) return;

        try {
          const local = await AsyncStorage.getItem(
            TURMAS_STORAGE_KEY
          );

          if (local) {
            const turmasLocais = JSON.parse(local);

            if (Array.isArray(turmasLocais)) {
              setTurmas(
                turmasLocais.map(normalizarTurma)
              );
            }
          }
        } catch (error) {
          console.warn(
            'Erro ao carregar turmas locais:',
            error
          );
        }
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

  // ==============================
  // AUTH CHANGED LISTENER
  // ==============================

  useEffect(() => {
    const cleanup = onAuthChanged(async () => {
      const token = await getToken();

      if (!token) {
        return;
      }

      try {
        const dados = await getTurmas();

        const normalizadas = Array.isArray(dados)
          ? dados.map(normalizarTurma)
          : [];

        setTurmas(normalizadas);

        try {
          await AsyncStorage.setItem(
            TURMAS_STORAGE_KEY,
            JSON.stringify(normalizadas)
          );
        } catch (error) {
          console.warn(
            'Erro ao salvar turmas localmente:',
            error
          );
        }
      } catch (error) {
        console.error(
          'Erro ao recarregar turmas:',
          error
        );
      }
    });

    return cleanup;
  }, []);

  // ==============================
  // LOGOUT
  // ==============================

  async function logout() {
    setTurmas([]);

    try {
      await AsyncStorage.removeItem(
        TURMAS_STORAGE_KEY
      );
    } catch (error) {
      console.warn(
        'Erro ao limpar cache de turmas:',
        error
      );
    }
  }

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

      try {
        await AsyncStorage.setItem(
          TURMAS_STORAGE_KEY,
          JSON.stringify([
            turmaNormalizada,
            ...turmas,
          ])
        );
      } catch (error) {
        console.warn(
          'Erro ao salvar turmas localmente:',
          error
        );
      }

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

      try {
        await AsyncStorage.setItem(
          TURMAS_STORAGE_KEY,
          JSON.stringify(
            turmas.map((item) =>
              String(item.id) === String(id)
                ? turmaNormalizada
                : item
            )
          )
        );
      } catch (error) {
        console.warn(
          'Erro ao salvar turmas localmente:',
          error
        );
      }

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

      const turmasAtualizadas = turmas.filter(
        (turma) =>
          String(turma.id) !== String(id)
      );

      setTurmas(turmasAtualizadas);

      try {
        await AsyncStorage.setItem(
          TURMAS_STORAGE_KEY,
          JSON.stringify(turmasAtualizadas)
        );
      } catch (error) {
        console.warn(
          'Erro ao salvar turmas localmente:',
          error
        );
      }
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
        logout,
      }}
    >
      {children}
    </TurmaContext.Provider>
  );
}

export function useTurmas() {
  return useContext(TurmaContext);
}