// 🔥 DOJO CONTEXT - JWT + POSTGRESQL + NORMALIZAÇÃO DOS DADOS

import {
  deleteCobranca,
  getAlunos,
  getToken,
  loginProfessor,
  postAluno,
  postCobranca,
  removeToken,
  updateCobranca,
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
  administrador: boolean;
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

  buscarAluno: (
    id: string
  ) => Aluno | undefined;

  adicionarCobranca: (
    alunoId: string,
    cobranca: Omit<Cobranca, "id">
  ) => Promise<void>;

  // Compatível com:
  // registrarPagamento(cobrancaId, dados)
  // registrarPagamento(alunoId, cobrancaId, data, forma)
  registrarPagamento: (
    primeiroId: string,
    segundo?: string | Partial<Cobranca>,
    pagoEm?: string,
    formaPagamento?: string
  ) => Promise<void>;

  // Compatível com:
  // removerCobranca(cobrancaId)
  // removerCobranca(alunoId, cobrancaId)
  removerCobranca: (
    primeiroId: string,
    cobrancaId?: string
  ) => Promise<void>;

  // Compatível com:
  // marcarCobrancaComoPaga(cobrancaId)
  // marcarCobrancaComoPaga(alunoId, cobrancaId)
  marcarCobrancaComoPaga: (
    primeiroId: string,
    cobrancaId?: string
  ) => Promise<void>;

  executarCobrancasAutomaticas: () => Promise<number>;
}

// ==============================
// CONTEXT
// ==============================

const DojoContext =
  createContext<DojoContextData>(
    {} as DojoContextData
  );

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
      Array.isArray(
        aluno?.historicoGraduacao
      )
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
    (aluno) =>
      normalizarAluno(aluno)
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
        // VERIFICAR JWT
        // ==========================

        const token =
          await getToken();

        // Sem JWT, não existe sessão
        // válida para acessar a API.
        if (!token) {

          await AsyncStorage.removeItem(
            USER_STORAGE_KEY
          );

          setUserLogado(null);
          setAlunos([]);

          return;
        }

        // ==========================
        // CARREGAR USUÁRIO
        // ==========================

        const user =
          await AsyncStorage.getItem(
            USER_STORAGE_KEY
          );

        if (!user) {

          // Existe JWT, mas não existe
          // usuário local. Limpa a sessão.
          await AsyncStorage.removeItem(
            USER_STORAGE_KEY
          );

          setUserLogado(null);
          setAlunos([]);

          return;
        }

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
            administrador: usuario.administrador === true,
            });

          } else {

            await AsyncStorage.removeItem(
              USER_STORAGE_KEY
            );

            setUserLogado(null);
            setAlunos([]);

            return;
          }

        } catch (error) {

          console.warn(
            "Erro ao interpretar usuário salvo:",
            error
          );

          await AsyncStorage.removeItem(
            USER_STORAGE_KEY
          );

          setUserLogado(null);
          setAlunos([]);

          return;
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

          const mensagem =
            error instanceof Error
              ? error.message
              : String(error);

          // ========================
          // TOKEN INVÁLIDO
          // ========================

          if (
            mensagem.includes(
              "Token inválido"
            ) ||
            mensagem.includes(
              "Token de autenticação"
            ) ||
            mensagem.includes(
              "401"
            )
          ) {

            await AsyncStorage.removeItem(
              USER_STORAGE_KEY
            );

            setUserLogado(null);
            setAlunos([]);

            return;
          }

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

        setUserLogado(null);
        setAlunos([]);

        await AsyncStorage.removeItem(
          USER_STORAGE_KEY
        );

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

      administrador:
        res.professor.administrador === true,

      };

      setUserLogado(user);

      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
      );

      // ==========================
      // CARREGAR ALUNOS APÓS LOGIN
      // ==========================

      try {

        const apiAlunos =
          await getAlunos();

        setAlunos(
          normalizarAlunos(
            apiAlunos
          )
        );

      } catch (error) {

        console.warn(
          "Erro ao carregar alunos após login:",
          error
        );

      }

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

    setAlunos([]);

    await AsyncStorage.removeItem(
      USER_STORAGE_KEY
    );

    await removeToken();

  }

  // ==============================
  // BUSCAR ALUNO
  // ==============================

  function buscarAluno(
    id: string
  ): Aluno | undefined {

    return alunos.find(
      (aluno) =>
        aluno.id === String(id)
    );

  }

  // ==============================
  // ADICIONAR ALUNO
  // ==============================

  async function adicionarAluno(
  aluno: Omit<Aluno, "id">
): Promise<void> {

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
  // ADICIONAR COBRANÇA
  // ==============================

  async function adicionarCobranca(
    alunoId: string,
    cobranca: Omit<Cobranca, "id">
  ): Promise<void> {

    const novaCobranca =
      await postCobranca({
        ...cobranca,
        alunoId,
      } as Omit<
        Cobranca,
        "id"
      >);

    setAlunos(
      (prev) =>
        prev.map(
          (aluno) =>
            aluno.id ===
            String(alunoId)
              ? {
                  ...aluno,

                  cobrancas: [
                    novaCobranca,
                    ...(aluno.cobrancas ||
                      []),
                  ],
                }
              : aluno
        )
    );

  }

  // ==============================
  // REGISTRAR PAGAMENTO
  // ==============================

  async function registrarPagamento(
    primeiroId: string,
    segundo?: string | Partial<Cobranca>,
    pagoEm?: string,
    formaPagamento?: string
  ): Promise<void> {

    let cobrancaId =
      String(primeiroId);

    let dados:
      | Partial<Cobranca>
      | undefined;

    // ==========================
    // FORMATO ANTIGO
    // ==========================

    if (
      typeof segundo === "string"
    ) {

      cobrancaId =
        String(segundo);

      dados = {

        pagoEm:
          pagoEm ||
          new Date()
            .toISOString()
            .slice(0, 10),

        formaPagamento:
          formaPagamento,

      };

    }

    // ==========================
    // FORMATO NOVO
    // ==========================

    else {

      dados =
        segundo;

    }

    const dataPagamento =
      dados?.pagoEm ||
      new Date()
        .toISOString()
        .slice(0, 10);

    const dadosPagamento:
      Partial<Cobranca> = {

      ...(dados || {}),

      status:
        "pago",

      pagoEm:
        dataPagamento,

    };

    await updateCobranca(
      cobrancaId,
      dadosPagamento
    );

    setAlunos(
      (prev) =>
        prev.map(
          (aluno) => ({

            ...aluno,

            cobrancas:
              (
                aluno.cobrancas ||
                []
              ).map(
                (cobranca) =>
                  cobranca.id ===
                  cobrancaId
                    ? {
                        ...cobranca,
                        ...dadosPagamento,
                      }
                    : cobranca
              ),

          })
        )
    );

  }

  // ==============================
  // REMOVER COBRANÇA
  // ==============================

  async function removerCobranca(
    primeiroId: string,
    segundoId?: string
  ): Promise<void> {

    const cobrancaId =
      String(
        segundoId ||
        primeiroId
      );

    await deleteCobranca(
      cobrancaId
    );

    setAlunos(
      (prev) =>
        prev.map(
          (aluno) => ({

            ...aluno,

            cobrancas:
              (
                aluno.cobrancas ||
                []
              ).filter(
                (cobranca) =>
                  cobranca.id !==
                  cobrancaId
              ),

          })
        )
    );

  }

  // ==============================
  // MARCAR COBRANÇA COMO PAGA
  // ==============================

  async function marcarCobrancaComoPaga(
    primeiroId: string,
    segundoId?: string
  ): Promise<void> {

    const cobrancaId =
      String(
        segundoId ||
        primeiroId
      );

    await registrarPagamento(
      cobrancaId,
      {
        status:
          "pago",

        pagoEm:
          new Date()
            .toISOString()
            .slice(0, 10),
      }
    );

  }

  // ==============================
  // COBRANÇAS AUTOMÁTICAS
  // ==============================

  async function executarCobrancasAutomaticas(): Promise<number> {

    const hoje =
      new Date()
        .toISOString()
        .slice(0, 10);

    const alunosAtivos =
      alunos.filter(
        (aluno) =>
          aluno.ativo
      );

    let quantidadeGerada =
      0;

    for (
      const aluno
      of alunosAtivos
    ) {

      const cobrancas =
        aluno.cobrancas || [];

      const possuiPendente =
        cobrancas.some(
          (cobranca) =>
            cobranca.status ===
              "pendente" ||
            cobranca.status ===
              "atrasado"
        );

      if (possuiPendente) {
        continue;
      }

      if (
        !aluno.valorMensalidade ||
        Number(
          aluno.valorMensalidade
        ) <= 0
      ) {
        continue;
      }

      const novaCobranca =
        await postCobranca({

          descricao:
            `Mensalidade - ${aluno.nome}`,

          valor:
            Number(
              aluno.valorMensalidade
            ),

          vencimento:
            aluno.proximaCobranca ||
            hoje,

          status:
            "pendente",

          alunoId:
            aluno.id,

        } as Omit<
          Cobranca,
          "id"
        >);

      quantidadeGerada++;

      setAlunos(
        (prev) =>
          prev.map(
            (item) =>
              item.id ===
              aluno.id
                ? {
                    ...item,

                    cobrancas: [
                      novaCobranca,
                      ...(item.cobrancas ||
                        []),
                    ],
                  }
                : item
          )
      );

    }

    return quantidadeGerada;
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
        buscarAluno,

        adicionarCobranca,
        registrarPagamento,
        removerCobranca,
        marcarCobrancaComoPaga,
        executarCobrancasAutomaticas,

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



