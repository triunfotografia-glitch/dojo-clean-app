// 🔥 DOJO CONTEXT - JWT + POSTGRESQL + NORMALIZAÇÃO DOS DADOS

import {
  getAlunos,
  loginProfessor,
  postAluno,
} from "@/services/api";

import AsyncStorage from "@react-native-async-storage/async-storage";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// ==============================
// TYPES
// ==============================

export interface UserLogado {
  id: string;
  nome: string;
  tipo: "professor";
}

export interface Graduacao {
  id: string;
  faixa: string;
  data: string;
  professor: string;
  observacao: string;
}

export interface Cobranca {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  competencia?: string;
  status?: "pendente" | "pago" | "atrasado";
  pagoEm?: string;
  formaPagamento?: string;
  observacao?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  foto: string;
  dataNascimento: string;
  faixa: string;
  graus: number;
  historicoGraduacao: Graduacao[];
  turma: string;
  professorId?: string;
  dataEntrada: string;
  ativo: boolean;
  mensalidade: string;
  valorMensalidade: string;
  diaVencimento: number;
  proximaCobranca: string;
  cobrancas: Cobranca[];
  observacao: string;
  criadoEm: string;
}

// ==============================
// CONTEXT
// ==============================

interface DojoContextData {
  alunos: Aluno[];
  userLogado: UserLogado | null;
  carregado: boolean;

  login: (
    nome: string,
    senha: string
  ) => Promise<UserLogado | null>;

  logout: () => void;

  adicionarAluno: (
    aluno: Aluno
  ) => Promise<void>;

  removerAluno: (
    id: string
  ) => void;

  editarAluno: (
    aluno: Aluno
  ) => void;
}

// ==============================
// CONTEXT
// ==============================

const DojoContext =
  createContext<DojoContextData>({} as DojoContextData);

// ==============================
// STORAGE
// ==============================

const STORAGE_KEY = "@dojo_alunos";
const USER_STORAGE_KEY = "@dojo_user";

// ==============================
// NORMALIZAR ALUNO
// ==============================

function normalizarAluno(
  aluno: any
): Aluno {
  return {
    ...aluno,

    id:
      aluno?.id !== undefined &&
      aluno?.id !== null
        ? String(aluno.id)
        : "",

    nome:
      typeof aluno?.nome === "string"
        ? aluno.nome
        : "",

    email:
      typeof aluno?.email === "string"
        ? aluno.email
        : "",

    telefone:
      typeof aluno?.telefone === "string"
        ? aluno.telefone
        : "",

    foto:
      typeof aluno?.foto === "string"
        ? aluno.foto
        : "",

    dataNascimento:
      typeof aluno?.dataNascimento === "string"
        ? aluno.dataNascimento
        : "",

    faixa:
      typeof aluno?.faixa === "string"
        ? aluno.faixa
        : "Branca",

    graus:
      typeof aluno?.graus === "number"
        ? aluno.graus
        : 0,

    historicoGraduacao:
      Array.isArray(aluno?.historicoGraduacao)
        ? aluno.historicoGraduacao
        : [],

    turma:
      typeof aluno?.turma === "string"
        ? aluno.turma
        : "",

    professorId:
      aluno?.professorId !== undefined &&
      aluno?.professorId !== null
        ? String(aluno.professorId)
        : undefined,

    dataEntrada:
      typeof aluno?.dataEntrada === "string"
        ? aluno.dataEntrada
        : "",

    ativo:
      typeof aluno?.ativo === "boolean"
        ? aluno.ativo
        : true,

    mensalidade:
      typeof aluno?.mensalidade === "string"
        ? aluno.mensalidade
        : "",

    valorMensalidade:
      typeof aluno?.valorMensalidade === "string"
        ? aluno.valorMensalidade
        : "",

    diaVencimento:
      typeof aluno?.diaVencimento === "number"
        ? aluno.diaVencimento
        : 10,

    proximaCobranca:
      typeof aluno?.proximaCobranca === "string"
        ? aluno.proximaCobranca
        : "",

    // 🔥 CORREÇÃO PRINCIPAL
    // O backend atualmente pode não retornar cobrancas.
    // Nunca deixaremos cobrancas como undefined.
    cobrancas:
      Array.isArray(aluno?.cobrancas)
        ? aluno.cobrancas
        : [],

    observacao:
      typeof aluno?.observacao === "string"
        ? aluno.observacao
        : "",

    criadoEm:
      typeof aluno?.criadoEm === "string"
        ? aluno.criadoEm
        : "",
  };
}

// ==============================
// NORMALIZAR LISTA
// ==============================

function normalizarAlunos(
  lista: any
): Aluno[] {
  if (!Array.isArray(lista)) {
    return [];
  }

  return lista.map(
    (aluno) => normalizarAluno(aluno)
  );
}

// ==============================
// PROVIDER
// ==============================

export function DojoProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

  const [userLogado, setUserLogado] =
    useState<UserLogado | null>(null);

  const [carregado, setCarregado] =
    useState(false);

  // ==============================
  // LOAD INICIAL
  // ==============================

  useEffect(() => {

    async function carregar() {

      try {

        // ==========================
        // CARREGAR USUÁRIO
        // ==========================

        const user =
          await AsyncStorage.getItem(
            USER_STORAGE_KEY
          );

        if (user) {

          try {

            const usuario =
              JSON.parse(user);

            if (
              usuario &&
              usuario.id &&
              usuario.nome &&
              usuario.tipo === "professor"
            ) {

              setUserLogado({
                id: String(usuario.id),
                nome: String(usuario.nome),
                tipo: "professor",
              });

            }

          } catch (error) {

            console.warn(
              "Erro ao interpretar usuário salvo:",
              error
            );

            await AsyncStorage.removeItem(
              USER_STORAGE_KEY
            );

          }

        }

        // ==========================
        // CARREGAR ALUNOS DA API
        // ==========================

        try {

          const apiAlunos =
            await getAlunos();

          const alunosNormalizados =
            normalizarAlunos(
              apiAlunos
            );

          setAlunos(
            alunosNormalizados
          );

        } catch (error) {

          console.warn(
            "Erro ao carregar alunos da API:",
            error
          );

          // ========================
          // FALLBACK LOCAL
          // ========================

          const local =
            await AsyncStorage.getItem(
              STORAGE_KEY
            );

          if (local) {

            try {

              const alunosLocais =
                JSON.parse(local);

              setAlunos(
                normalizarAlunos(
                  alunosLocais
                )
              );

            } catch (error) {

              console.warn(
                "Erro ao carregar alunos locais:",
                error
              );

              setAlunos([]);

            }

          } else {

            setAlunos([]);

          }

        }

      } catch (error) {

        console.warn(
          "Erro ao carregar DojoContext:",
          error
        );

        setAlunos([]);

      } finally {

        setCarregado(true);

      }

    }

    carregar();

  }, []);

  // ==============================
  // SALVAR ALUNOS LOCALMENTE
  // ==============================

  useEffect(() => {

    if (!carregado) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(alunos)
    ).catch((error) => {

      console.warn(
        "Erro ao salvar alunos localmente:",
        error
      );

    });

  }, [
    alunos,
    carregado,
  ]);

  // ==============================
  // LOGIN
  // ==============================

  async function login(
    nome: string,
    senha: string
  ): Promise<UserLogado | null> {

    try {

      const res =
        await loginProfessor(
          nome,
          senha
        );

      if (
        !res ||
        !res.sucesso ||
        !res.token ||
        !res.professor
      ) {

        return null;

      }

      const user: UserLogado = {

        id:
          String(
            res.professor.id
          ),

        nome:
          res.professor.nome,

        tipo:
          "professor",

      };

      // ==========================
      // ESTADO
      // ==========================

      setUserLogado(user);

      // ==========================
      // STORAGE
      // ==========================

      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
      );

      return user;

    } catch (error) {

      console.error(
        "Erro login:",
        error
      );

      return null;

    }

  }

  // ==============================
  // LOGOUT
  // ==============================

  async function logout() {

    setUserLogado(null);

    await AsyncStorage.removeItem(
      USER_STORAGE_KEY
    );

  }

  // ==============================
  // ADICIONAR ALUNO
  // ==============================

  async function adicionarAluno(
    aluno: Aluno
  ) {

    const novo =
      await postAluno(aluno);

    const alunoNormalizado =
      normalizarAluno(novo);

    setAlunos(
      (prev) => [
        ...prev,
        alunoNormalizado,
      ]
    );

  }

  // ==============================
  // REMOVER ALUNO
  // ==============================

  function removerAluno(
    id: string
  ) {

    setAlunos(
      (prev) =>
        prev.filter(
          (aluno) =>
            aluno.id !== String(id)
        )
    );

  }

  // ==============================
  // EDITAR ALUNO
  // ==============================

  function editarAluno(
    aluno: Aluno
  ) {

    const alunoNormalizado =
      normalizarAluno(aluno);

    setAlunos(
      (prev) =>
        prev.map(
          (item) =>
            item.id ===
            alunoNormalizado.id
              ? alunoNormalizado
              : item
        )
    );

  }

  // ==============================
  // AGUARDAR CARREGAMENTO
  // ==============================

  if (!carregado) {
    return null;
  }

  // ==============================
  // PROVIDER
  // ==============================

  return (

    <DojoContext.Provider
      value={{
        alunos,
        userLogado,
        carregado,
        login,
        logout,
        adicionarAluno,
        removerAluno,
        editarAluno,
      }}
    >

      {children}

    </DojoContext.Provider>

  );

}

// ==============================
// HOOK
// ==============================

export function useDojo() {

  return useContext(
    DojoContext
  );

}