import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  deleteTreino,
  getToken,
  getTreinos,
  isTokenExpired,
  onAuthLost,
  onAuthChanged,
  postTreino,
  putTreino,
} from '@/services/api';

const TREINOS_STORAGE_KEY = '@dojo_lb:treinos';

export interface Treino {
  id: string;
  nome: string;
  dia: string;
  horario: string;
  turma: string;
  professor: string;
  turmaId?: string;
  professorId?: string;
}

interface TreinoContextData {
  treinos: Treino[];
  adicionarTreino: (treino: Treino) => Promise<void>;
  editarTreino: (treino: Treino) => Promise<void>;
  excluirTreino: (id: string) => Promise<void>;
  buscarTreino: (id: string) => Treino | undefined;
  logout: () => Promise<void>;
}

const TreinoContext = createContext<TreinoContextData>(
  {} as TreinoContextData,
);

function normalizarTreino(treino: any): Treino {
  return {
    ...treino,
    id: String(treino.id),
    turmaId: treino.turmaId != null ? String(treino.turmaId) : undefined,
    professorId: treino.professorId != null ? String(treino.professorId) : undefined,
  } as Treino;
}

export function TreinoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [treinos, setTreinos] = useState<Treino[]>([]);

  useEffect(() => {
    let ativo = true;

    async function carregarTreinos() {
      const token = await getToken();

      if (!token || !ativo) {
        return;
      }

      if (isTokenExpired(token)) {
        return;
      }

      const userJson =
        await AsyncStorage.getItem(
          '@dojo_user'
        );

      if (!userJson) {
        return;
      }

      try {
        const dados = await getTreinos();

        if (!ativo) return;

        const normalizados = Array.isArray(dados)
          ? dados.map(normalizarTreino)
          : [];

        setTreinos(normalizados);

        try {
          await AsyncStorage.setItem(
            TREINOS_STORAGE_KEY,
            JSON.stringify(normalizados)
          );
        } catch (error) {
          console.warn(
            'Erro ao salvar treinos localmente:',
            error
          );
        }
      } catch (error) {
        console.error(
          'Erro ao carregar treinos:',
          error,
        );

        if (!ativo) return;

        try {
          const local = await AsyncStorage.getItem(
            TREINOS_STORAGE_KEY
          );

          if (local) {
            const treinosLocais = JSON.parse(local);

            if (Array.isArray(treinosLocais)) {
              setTreinos(
                treinosLocais.map(normalizarTreino)
              );
            }
          }
        } catch (error) {
          console.warn(
            'Erro ao carregar treinos locais:',
            error
          );
        }
      }
    }

    void carregarTreinos();

    return () => {
      ativo = false;
    };
  }, []);

  // ==============================
  // AUTH LOSS LISTENER
  // ==============================

  useEffect(() => {
    const cleanup = onAuthLost(() => {
      setTreinos([]);
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
        const dados = await getTreinos();

        const normalizados = Array.isArray(dados)
          ? dados.map(normalizarTreino)
          : [];

        setTreinos(normalizados);

        try {
          await AsyncStorage.setItem(
            TREINOS_STORAGE_KEY,
            JSON.stringify(normalizados)
          );
        } catch (error) {
          console.warn(
            'Erro ao salvar treinos localmente:',
            error
          );
        }
      } catch (error) {
        console.error(
          'Erro ao carregar treinos:',
          error,
        );
      }
    });

    return cleanup;
  }, []);

  // ==============================
  // LOGOUT
  // ==============================

  async function logout() {
    setTreinos([]);

    try {
      await AsyncStorage.removeItem(
        TREINOS_STORAGE_KEY
      );
    } catch (error) {
      console.warn(
        'Erro ao limpar cache de treinos:',
        error
      );
    }
  }

  async function adicionarTreino(
    treino: Treino,
  ) {
    try {
      const novoTreino = await postTreino(
        treino,
      );

      const normalizado =
        normalizarTreino(novoTreino);

      setTreinos((lista) => [
        normalizado,
        ...lista,
      ]);

      try {
        await AsyncStorage.setItem(
          TREINOS_STORAGE_KEY,
          JSON.stringify([
            normalizado,
            ...treinos,
          ])
        );
      } catch (error) {
        console.warn(
          'Erro ao salvar treinos localmente:',
          error
        );
      }
    } catch (error) {
      console.error(
        'Erro ao adicionar treino:',
        error,
      );

      throw error;
    }
  }

  async function editarTreino(
    treino: Treino,
  ) {
    try {
      const atualizado =
        await putTreino(
          treino.id,
          treino,
        );

      const normalizado =
        normalizarTreino(atualizado);

      setTreinos((lista) =>
        lista.map((item) =>
          item.id === treino.id
            ? normalizado
            : item,
        ),
      );

      try {
        await AsyncStorage.setItem(
          TREINOS_STORAGE_KEY,
          JSON.stringify(
            treinos.map((item) =>
              item.id === treino.id
                ? normalizado
                : item
            )
          )
        );
      } catch (error) {
        console.warn(
          'Erro ao salvar treinos localmente:',
          error
        );
      }
    } catch (error) {
      console.error(
        'Erro ao editar treino:',
        error,
      );

      throw error;
    }
  }

  async function excluirTreino(
    id: string,
  ) {
    try {
      await deleteTreino(id);

      const treinosAtualizados = treinos.filter(
        (item) => item.id !== String(id),
      );

      setTreinos(treinosAtualizados);

      try {
        await AsyncStorage.setItem(
          TREINOS_STORAGE_KEY,
          JSON.stringify(treinosAtualizados)
        );
      } catch (error) {
        console.warn(
          'Erro ao salvar treinos localmente:',
          error
        );
      }
    } catch (error) {
      console.error(
        'Erro ao excluir treino:',
        error,
      );

      throw error;
    }
  }

  function buscarTreino(
    id: string,
  ) {
    return treinos.find(
      (item) => item.id === String(id),
    );
  }

  return (
    <TreinoContext.Provider
      value={{
        treinos,
        adicionarTreino,
        editarTreino,
        excluirTreino,
        buscarTreino,
        logout,
      }}
    >
      {children}
    </TreinoContext.Provider>
  );
}

export function useTreinos() {
  return useContext(TreinoContext);
}
