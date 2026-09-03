// 🔥 DOJO CONTEXT - JWT + POSTGRESQL + NORMALIZAÇÃO DOS DADOS

import {
  ApiError,
  deleteAluno,
  deleteCobranca,
  getAlunos,
  getToken,
  isTokenExpired,
  loginProfessor,
  notifyAuthChanged,
  notifyAuthLost,
  onAuthChanged,
  onAuthLost,
  postAluno,
  postCobranca,
  removeToken,
  updateAluno,
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
  alunoId?: string | number;
  faixa: string;
  data: string;
  professor: string;
  observacao: string;
}

export interface Cobranca {
  id: string;
  alunoId?: string | number;
  descricao: string;
  valor: number;
  vencimento: string;
  competencia?: string;
  status?: "pendente" | "pago" | "atrasado";
  pagoEm?: string;
  formaPagamento?: string;
  observacao?: string;
  pixChaveId?: string | number;
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
  professorId?: string | null;
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
  ) => Promise<void>;

  editarAluno: (
    aluno: Aluno
  ) => Promise<void>;

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

function normalizarCobranca(
  cobranca: any
): Cobranca {
  return {
    id: String(
      cobranca?.id ??
      cobranca?.ID ??
      ''
    ),
    descricao:
      typeof cobranca?.descricao === 'string'
        ? cobranca.descricao
        : '',
    valor:
      typeof cobranca?.valor === 'number'
        ? cobranca.valor
        : Number(cobranca?.valor || 0),
    vencimento:
      typeof cobranca?.vencimento === 'string'
        ? cobranca.vencimento
        : '',
    competencia:
      typeof cobranca?.competencia === 'string'
        ? cobranca.competencia
        : undefined,
    status:
      cobranca?.status === 'pago' ||
      cobranca?.status === 'atrasado'
        ? cobranca.status
        : 'pendente',
    pagoEm:
      typeof cobranca?.pagoEm === 'string'
        ? cobranca.pagoEm
        : typeof cobranca?.pago_em === 'string'
          ? cobranca.pago_em
          : undefined,
    formaPagamento:
      typeof cobranca?.formaPagamento === 'string'
        ? cobranca.formaPagamento
        : typeof cobranca?.forma_pagamento === 'string'
          ? cobranca.forma_pagamento
          : undefined,
    observacao:
      typeof cobranca?.observacao === 'string'
        ? cobranca.observacao
        : undefined,
  };
}

function normalizarCobrancas(
  lista: any
): Cobranca[] {
  if (!Array.isArray(lista)) {
    return [];
  }

  return lista.map(
    (cobranca) =>
      normalizarCobranca(cobranca)
  );
}

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
      normalizarCobrancas(
        aluno?.cobrancas
      ),

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

    let ativo = true;

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
        // VERIFICAR EXPIRAÇÃO DO JWT
        // ==========================

        if (
          isTokenExpired(token)
        ) {

          await AsyncStorage.removeItem(
            USER_STORAGE_KEY
          );

          await removeToken();

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

          if (!ativo) return;

          setAlunos(
            alunosNormalizados
          );

        } catch (error) {

          console.error(
            "Erro ao carregar alunos da API:",
            error
          );

          const mensagem =
            error instanceof Error
              ? error.message
              : String(error);

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

              if (!ativo) return;

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

              if (!ativo) return;

              setAlunos([]);

            }

          } else {

            if (!ativo) return;

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
      setUserLogado(null);
      setAlunos([]);
      AsyncStorage.removeItem(
        USER_STORAGE_KEY
      ).catch(() => {});
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
        const dados = await getAlunos();

        const normalizados =
          Array.isArray(dados)
            ? normalizarAlunos(dados)
            : [];

        setAlunos(normalizados);

        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(normalizados)
          );
        } catch (error) {
          console.warn(
            'Erro ao salvar alunos localmente:',
            error
          );
        }
      } catch (error) {
        console.error(
          'Erro ao recarregar alunos:',
          error
        );
      }
    });

    return cleanup;
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

      notifyAuthChanged();

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

    notifyAuthLost();

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

    try {

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

    } catch (error) {

      console.error(
        "Erro ao adicionar aluno:",
        error
      );

      throw error;

    }

  }

  // ==============================
  // REMOVER ALUNO
  // ==============================

  async function removerAluno(
    id: string
  ): Promise<void> {

    try {

      await deleteAluno(
        id
      );

      setAlunos(
        (prev) =>
          prev.filter(
            (aluno) =>
              aluno.id !== String(id)
          )
      );

    } catch (error) {

      console.error(
        "Erro ao excluir aluno:",
        error
      );

      throw error;

    }

  }

  // ==============================
  // EDITAR ALUNO
  // ==============================

  async function editarAluno(
    aluno: Aluno
  ): Promise<void> {

    try {

      const alunoNormalizado =
        normalizarAluno(aluno);

      const atualizado =
        await updateAluno(
          alunoNormalizado.id,
          alunoNormalizado
        );

      const alunoAtualizado =
        normalizarAluno(
          atualizado
        );

      setAlunos(
        (prev) =>
          prev.map(
            (item) =>
              item.id ===
                alunoAtualizado.id
                ? alunoAtualizado
                : item
          )
      );

    } catch (error) {

      console.error(
        "Erro ao editar aluno:",
        error
      );

      throw error;

    }

  }

  // ==============================
  // ADICIONAR COBRANÇA
  // ==============================

  async function adicionarCobranca(
    alunoId: string,
    cobranca: Omit<Cobranca, "id">
  ): Promise<void> {

    try {

      const novaCobranca =
        await postCobranca({
          ...cobranca,
          alunoId,
        } as Omit<
          Cobranca,
          "id"
        >);

      const cobrancaNormalizada =
        normalizarCobranca(
          novaCobranca
        );

      setAlunos(
        (prev) =>
          prev.map(
            (aluno) =>
              aluno.id ===
              String(alunoId)
                ? {
                    ...aluno,

                    cobrancas: [
                      cobrancaNormalizada,
                      ...(aluno.cobrancas ||
                        []),
                    ],
                  }
                : aluno
          )
      );

    } catch (error) {

      console.error(
        'Erro ao adicionar cobrança:',
        error
      );

      throw error;

    }

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

    try {

      let cobrancaId =
        String(primeiroId);

      let dados:
        | Partial<Cobranca>
        | undefined;

      // ==========================
      // FORMATO ANTIGO
      // ==========================

      if (
        typeof segundo === "string" ||
        typeof segundo === "number"
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

      const alunoAtualizado =
        alunos.find(
          (aluno) =>
            aluno.cobrancas?.some(
              (cobranca) =>
                cobranca.id === cobrancaId
            )
        );

      if (alunoAtualizado) {
        const cobrancaPaga =
          alunoAtualizado.cobrancas.find(
            (cobranca) =>
              cobranca.id === cobrancaId
          );

        if (cobrancaPaga) {
          const proximoVencimento =
            calcularProximoVencimento({
              ...alunoAtualizado,
              proximaCobranca:
                cobrancaPaga.vencimento,
            });

          await updateAluno(
            alunoAtualizado.id,
            {
              ...alunoAtualizado,
              proximaCobranca:
                proximoVencimento,
            }
          );

          setAlunos(
            (prev) =>
              prev.map(
                (item) =>
                  item.id ===
                    alunoAtualizado.id
                    ? {
                        ...item,

                        cobrancas:
                          (
                            item.cobrancas ||
                            []
                          ).map(
                            (cobranca) =>
                              cobranca.id ===
                                cobrancaId
                                ? normalizarCobranca(
                                    {
                                      ...cobranca,
                                      ...dadosPagamento,
                                    }
                                  )
                                : cobranca
                          ),

                        proximaCobranca:
                          proximoVencimento,
                      }
                    : item
              )
          );

          return;
        }
      }

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
                      ? normalizarCobranca(
                          {
                            ...cobranca,
                            ...dadosPagamento,
                          }
                        )
                      : cobranca
                ),

            })
          )
      );

    } catch (error) {

      console.error(
        "Erro ao registrar pagamento:",
        error
      );

      throw error;

    }

  }

  // ==============================
  // REMOVER COBRANÇA
  // ==============================

  async function removerCobranca(
    primeiroId: string,
    segundoId?: string
  ): Promise<void> {

    try {

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

    } catch (error) {

      console.error(
        "Erro ao remover cobrança:",
        error
      );

      throw error;

    }

  }

  // ==============================
  // MARCAR COBRANÇA COMO PAGA
  // ==============================

  async function marcarCobrancaComoPaga(
    primeiroId: string,
    segundoId?: string
  ): Promise<void> {

    try {

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

          formaPagamento:
            "Manual",
        }
      );

    } catch (error) {

      console.error(
        "Erro ao marcar cobrança como paga:",
        error
      );

      throw error;

    }

  }

  // ==============================
  // COBRANÇAS AUTOMÁTICAS
  // ==============================

  function calcularProximoVencimento(
    aluno: Aluno
  ): string {
    const dia =
      typeof aluno.diaVencimento === "number"
        ? aluno.diaVencimento
        : 10;

    const hoje =
      new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const vencimentoEsteMes = new Date(
      ano,
      mes,
      dia
    );

    const vencimentoProximoMes = new Date(
      ano,
      mes + 1,
      dia
    );

    const proximaCobrancaValida =
      aluno.proximaCobranca &&
      typeof aluno.proximaCobranca === "string";

    const referencia = proximaCobrancaValida
      ? new Date(aluno.proximaCobranca + "T00:00:00")
      : null;

    if (
      referencia &&
      !Number.isNaN(referencia.getTime()) &&
      referencia >= hoje
    ) {
      return referencia
        .toISOString()
        .slice(0, 10);
    }

    const vencimento =
      vencimentoEsteMes >= hoje
        ? vencimentoEsteMes
        : vencimentoProximoMes;

    return vencimento
      .toISOString()
      .slice(0, 10);
  }

  async function executarCobrancasAutomaticas(): Promise<number> {

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

      const vencimento =
        calcularProximoVencimento(aluno);

      const jaExiste =
        cobrancas.some((cobranca) => {
          const mesmaData =
            (cobranca.vencimento || "").split("T")[0] ===
            (vencimento || "").split("T")[0];

          return (
            String(cobranca.alunoId) ===
              String(aluno.id) &&
            mesmaData
          );
        });

      if (jaExiste) {
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

      try {

        const novaCobranca =
          await postCobranca({

            descricao:
              `Mensalidade - ${aluno.nome}`,

            valor:
              Number(
                aluno.valorMensalidade
              ),

            vencimento,

            status:
              "pendente",

            alunoId:
              aluno.id,

          } as Omit<
            Cobranca,
            "id"
          >);

        const cobrancaNormalizada =
          normalizarCobranca(
            novaCobranca
          );

        quantidadeGerada++;

        const proximoVencimento =
          calcularProximoVencimento({
            ...aluno,
            proximaCobranca: vencimento,
          });

        await updateAluno(
          aluno.id,
          {
            ...aluno,
            proximaCobranca:
              proximoVencimento,
          }
        );

        setAlunos(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                  aluno.id
                  ? {
                      ...item,

                      cobrancas: [
                        cobrancaNormalizada,
                        ...(item.cobrancas ||
                          []),
                      ],

                      proximaCobranca:
                        proximoVencimento,
                    }
                  : item
            )
        );

      } catch (error) {

        if (
          error instanceof ApiError &&
          error.status === 409
        ) {
          continue;
        }

        throw error;

      }

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



