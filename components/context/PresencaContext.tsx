import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getPresencas,
  postPresenca,
} from '@/services/api';

export type StatusPresenca =
  'presente' |
  'falta' |
  'justificado';

export interface Presenca {
  treinoId: string;
  alunoId: string;
  data: string;
  status: StatusPresenca;
}

interface PresencaContextData {
  presencas: Presenca[];
  registrarPresenca: (
    presenca: Presenca
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

  // ==========================================================
  // REGISTRAR PRESENÇA NO POSTGRESQL
  // ==========================================================

  async function registrarPresenca(
    presenca: Presenca
  ) {
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
  }

  // ==========================================================
  // CONTEXTO
  // ==========================================================

  return (
    <PresencaContext.Provider
      value={{
        presencas,
        registrarPresenca,
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
