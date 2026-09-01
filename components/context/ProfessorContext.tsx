import {
  deleteProfessor,
  getProfessores,
  getToken,
  onAuthChanged,
  onAuthLost,
  postProfessor,
  updateProfessor,
} from "@/services/api";

import { useDojo } from "@/components/context/DojoContext";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";


// ==============================
// PROFESSOR
// ==============================

export interface Professor {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  temSenha?: boolean;
  telefone?: string;
  faixa: string;
  graus?: number;
  especialidade: string;
  ativo: boolean;
  administrador?: boolean;
  alunoId?: string;
}


// ==============================
// CONTEXT DATA
// ==============================

interface ProfessorContextData {

  professores: Professor[];

  adicionarProfessor:
    (professor: Professor) => Promise<void>;

  recarregarProfessores:
    () => Promise<void>;

  editarProfessor:
    (professor: Professor) => Promise<void>;

  removerProfessor:
    (id: string) => void;

  excluirProfessor:
    (id: string) => Promise<void>;

  buscarProfessor:
    (id: string) => Professor | undefined;

  desvincularProfessor:
    (professorId: string) => void;

}


// ==============================
// CONTEXT
// ==============================

const ProfessorContext =
  createContext<ProfessorContextData>({

    professores: [],

    adicionarProfessor:
      async () => {},

    recarregarProfessores:
      async () => {},

    editarProfessor:
      async () => {},

    removerProfessor:
      () => {},

    excluirProfessor:
      async () => {},

    buscarProfessor:
      () => undefined,

    desvincularProfessor:
      () => {},

  });


// ==============================
// PROVIDER
// ==============================

export function ProfessorProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [
    professores,
    setProfessores,
  ] = useState<Professor[]>([]);

  const { userLogado } =
    useDojo();


  // ==============================
  // RECARREGAR PROFESSORES
  // ==============================

  async function recarregarProfessores() {

    try {

      const lista =
        await getProfessores();

      const professoresNormalizados =
        lista.map((p) => ({

          ...p,

          id:
            String(p.id),

        }));

      setProfessores(
        professoresNormalizados
      );

    } catch (error) {

      console.warn(
        "Erro ao carregar professores:",
        error
      );

    }

  }


  // ==============================
  // CARREGAR AO INICIAR
  // ==============================

  useEffect(() => {

    if (!userLogado) {

      return;

    }

    void recarregarProfessores();

  }, [userLogado]);

  // ==============================
  // AUTH LOSS LISTENER
  // ==============================

  useEffect(() => {
    const cleanup = onAuthLost(() => {
      setProfessores([]);
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
        await recarregarProfessores();
      } catch (error) {
        console.error(
          'Erro ao recarregar professores:',
          error
        );
      }
    });

    return cleanup;
  }, []);


  // ==============================
  // CRIAR PROFESSOR
  // ==============================

  async function adicionarProfessor(
    professor: Professor
  ): Promise<void> {

    try {

      const {
        id,
        ...dados
      } = professor;

      const criado =
        await postProfessor(
          dados
        );

      setProfessores(
        (lista) => [

          ...lista,

          {

            ...criado,

            id:
              String(
                criado.id
              ),

          },

        ]
      );

    } catch (error) {

      console.error(
        'Erro ao adicionar professor:',
        error
      );

      throw error;

    }

  }


  // ==============================
  // EDITAR PROFESSOR
  // ==============================

  async function editarProfessor(
    professor: Professor
  ): Promise<void> {

    try {

      const atualizado =
        await updateProfessor(
          professor.id,
          professor
        );

      setProfessores(
        (lista) =>

          lista.map(
            (item) =>

              item.id === professor.id

                ? {

                    ...atualizado,

                    id:
                      String(
                        atualizado.id
                      ),

                  }

                : item
        )
      );

    } catch (error) {

      console.error(
        'Erro ao editar professor:',
        error
      );

      throw error;

    }

  }


  // ==============================
  // REMOVER LOCAL
  // ==============================

  function removerProfessor(
    id: string
  ): void {

    setProfessores(
      (lista) =>

        lista.filter(
          (item) =>
            item.id !== id
        )
    );

  }


  // ==============================
  // EXCLUIR PROFESSOR
  // ==============================
  //
  // EXCLUSÃO REAL NO POSTGRESQL
  //
  // Primeiro exclui no backend.
  // Somente depois remove da lista
  // local.
  // ==============================

  async function excluirProfessor(
    id: string
  ): Promise<void> {

    try {

      // ==========================
      // EXCLUIR NO POSTGRESQL
      // ==========================

      await deleteProfessor(id);

      // ==========================
      // REMOVER DA MEMÓRIA LOCAL
      // ==========================

      setProfessores(
        (lista) =>
          lista.filter(
            (item) =>
              item.id !== id
          )
      );

    } catch (error) {

      console.error(
        "Erro ao excluir professor:",
        error
      );

      // Mantém o professor na lista
      // caso a exclusão no backend falhe.

      throw error;

    }

  }


  // ==============================
  // BUSCAR PROFESSOR
  // ==============================

  function buscarProfessor(
    id: string
  ): Professor | undefined {

    return professores.find(
      (item) =>
        item.id === id
    );

  }


  // ==============================
  // DESVINCULAR PROFESSOR
  // ==============================

  function desvincularProfessor(
    professorId: string
  ): void {

    setProfessores(
      (lista) =>

        lista.map(
          (professor) =>

            professor.id === professorId

              ? {

                  ...professor,

                  alunoId:
                    undefined,

                }

              : professor
        )
    );

  }


  // ==============================
  // PROVIDER
  // ==============================

  return (

    <ProfessorContext.Provider

      value={{

        professores,

        adicionarProfessor,

        recarregarProfessores,

        editarProfessor,

        removerProfessor,

        excluirProfessor,

        buscarProfessor,

        desvincularProfessor,

      }}

    >

      {children}

    </ProfessorContext.Provider>

  );

}


// ==============================
// HOOK
// ==============================

export function useProfessores() {

  return useContext(
    ProfessorContext
  );

}
