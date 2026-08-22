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
  postTreino,
  putTreino,
} from '@/services/api';

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
}

const TreinoContext = createContext<TreinoContextData>(
  {} as TreinoContextData,
);

function normalizarTreino(treino: any): Treino {
  return {
    ...treino,
    id: String(treino.id),
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

      try {
        const dados = await getTreinos();

        if (!ativo) return;

        setTreinos(
          Array.isArray(dados)
            ? dados.map(normalizarTreino)
            : [],
        );
      } catch (error) {
        console.error(
          'Erro ao carregar treinos:',
          error,
        );
      }
    }

    void carregarTreinos();

    return () => {
      ativo = false;
    };
  }, []);

  async function adicionarTreino(
    treino: Treino,
  ) {
    try {
      const novoTreino = await postTreino(
        treino,
      );

      setTreinos((lista) => [
        normalizarTreino(novoTreino),
        ...lista,
      ]);
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

      setTreinos((lista) =>
        lista.map((item) =>
          item.id === treino.id
            ? normalizarTreino(atualizado)
            : item,
        ),
      );
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

      setTreinos((lista) =>
        lista.filter(
          (item) => item.id !== String(id),
        ),
      );
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
      }}
    >
      {children}
    </TreinoContext.Provider>
  );
}

export function useTreinos() {
  return useContext(TreinoContext);
}
