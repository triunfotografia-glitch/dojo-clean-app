import {
  deletePresenca,
  getPresencas,
  getPresencasPorTreino,
  getToken,
  onAuthLost,
  onAuthChanged,
  postPresenca,
  putPresenca,
} from '@/services/api';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type StatusPresenca =
  'presente' |
  'falta' |
  'justificado';

export interface Presenca {
  id: string;
  treinoId: string;
  alunoId: string;
  data: string;
  status: StatusPresenca;
}

interface PresencaContextData {
  presencas: Presenca[];
  carregarPresencasPorTreino: (
    treinoId: string | number,
    data?: string
  ) => Promise<void>;
  registrarPresenca: (
    presenca: Omit<Presenca, 'id'>
  ) => Promise<void>;
  editarPresenca: (
    id: string,
    dados: Partial<Presenca>
  ) => Promise<void>;
  excluirPresenca: (
    id: string
  ) => Promise<void>;
}

const PresencaContext =
  createContext<PresencaContextData>(
    {} as PresencaContextData
  );

function normalizarPresenca(
  item: any
): Presenca {
  return {
    id: String(
      item?.id ??
      item?.ID ??
      ''
    ),
    treinoId: String(
      item?.treinoId ??
      item?.treino_id ??
      ''
    ),
    alunoId: String(
      item?.alunoId ??
      item?.aluno_id ??
      ''
    ),
    data: String(
      item?.data ??
      ''
    ),
    status:
      item?.status as StatusPresenca,
  };
}

export function PresencaProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [presencas, setPresencas] =
    useState<Presenca[]>([]);

  const [carregado, setCarregado] =
    useState(false);

  // ==========================================================
  // CARREGAR PRESENÇAS DO POSTGRESQL
  // ==========================================================

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const token = await getToken();

      if (!token || !ativo) {
        return;
      }

      try {
        const dados =
          await getPresencas();

        if (!ativo) return;

        const normalizadas =
          Array.isArray(dados)
            ? dados.map(normalizarPresenca)
            : [];

        setPresencas(
          normalizadas
        );
      } catch (error) {
        console.error(
          'Erro ao carregar presenças:',
          error
        );
      } finally {
        if (ativo) {
          setCarregado(true);
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
      setPresencas([]);
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
        const dados = await getPresencas();

        const normalizadas =
          Array.isArray(dados)
            ? dados.map(normalizarPresenca)
            : [];

        setPresencas(
          normalizadas
        );
      } catch (error) {
        console.error(
          'Erro ao recarregar presenças:',
          error
        );
      }
    });

    return cleanup;
  }, []);

  // ==========================================================
  // REGISTRAR PRESENÇA NO POSTGRESQL
  // ==========================================================

  async function registrarPresenca(
    presenca: Omit<Presenca, 'id'>
  ) {
    try {
      const resposta =
        await postPresenca(
          presenca
        );

      const novaPresenca =
        normalizarPresenca(
          resposta
        );

      setPresencas(
        (lista) => {
          const existe =
            lista.some(
              (item) =>
                item.treinoId ===
                  novaPresenca.treinoId &&
                item.alunoId ===
                  novaPresenca.alunoId &&
                item.data ===
                  novaPresenca.data
            );

          if (existe) {
            return lista.map(
              (item) =>
                item.treinoId ===
                  novaPresenca.treinoId &&
                item.alunoId ===
                  novaPresenca.alunoId &&
                item.data ===
                  novaPresenca.data
                  ? novaPresenca
                  : item
            );
          }

          return [
            ...lista,
            novaPresenca,
          ];
        }
      );
    } catch (error) {
      console.error(
        'Erro ao registrar presença:',
        error
      );

      throw error;
    }
  }

  // ==========================================================
  // CARREGAR PRESENÇAS POR TREINO
  // ==========================================================

  async function carregarPresencasPorTreino(
    treinoId: string | number,
    data?: string
  ) {
    try {
      const dados =
        await getPresencasPorTreino(
          treinoId,
          data
        );

      const normalizadas =
        Array.isArray(dados)
          ? dados.map(normalizarPresenca)
          : [];

      setPresencas(
        normalizadas
      );
    } catch (error) {
      console.error(
        'Erro ao carregar presenças por treino:',
        error
      );
    }
  }

  // ==========================================================
  // EDITAR PRESENÇA
  // ==========================================================

  async function editarPresenca(
    id: string,
    dados: Partial<Presenca>
  ) {
    try {
      const atualizada =
        await putPresenca(
          id,
          dados
        );

      const presencaNormalizada =
        normalizarPresenca(
          atualizada
        );

      setPresencas(
        (lista) =>
          lista.map(
            (item) =>
              item.id === presencaNormalizada.id
                ? presencaNormalizada
                : item
          )
      );
    } catch (error) {
      console.error(
        'Erro ao editar presença:',
        error
      );

      throw error;
    }
  }

  // ==========================================================
  // EXCLUIR PRESENÇA
  // ==========================================================

  async function excluirPresenca(
    id: string
  ) {
    try {
      await deletePresenca(
        id
      );

      setPresencas(
        (lista) =>
          lista.filter(
            (item) => item.id !== id
          )
      );
    } catch (error) {
      console.error(
        'Erro ao excluir presença:',
        error
      );

      throw error;
    }
  }

  // ==========================================================
  // CONTEXTO
  // ==========================================================

  return (
    <PresencaContext.Provider
      value={{
        presencas,
        carregarPresencasPorTreino,
        registrarPresenca,
        editarPresenca,
        excluirPresenca,
      }}
    >
      {children}
    </PresencaContext.Provider>
  );
}

export function usePresencas() {
  return useContext(
    PresencaContext
  );
}
