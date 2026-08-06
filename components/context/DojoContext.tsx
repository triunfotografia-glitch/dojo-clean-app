import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useProfessores } from "./ProfessorContext";
import { getAlunos } from "@/services/api";

// ==============================
// 🔐 USER
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
  senha?: string;
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

interface DojoContextData {
  alunos: Aluno[];
  userLogado: UserLogado | null;
  carregado: boolean;
  setUserLogado: (user: UserLogado | null) => void;

  login: (nome: string, senha: string) => UserLogado | null;
  logout: () => void;

  adicionarAluno: (aluno: Aluno) => void;
  removerAluno: (id: string) => void;
  buscarAluno: (id: string) => Aluno | undefined;
  editarAluno: (alunoAtualizado: Aluno) => void;

  adicionarCobranca: (alunoId: string, cobranca: Cobranca) => void;
  removerCobranca: (alunoId: string, cobrancaId: string) => void;

  registrarPagamento: (
    alunoId: string,
    cobrancaId: string,
    pagoEm: string,
    formaPagamento: string
  ) => void;

  marcarCobrancaComoPaga: (
    alunoId: string,
    cobrancaId: string
  ) => void;

  gerarMensalidadesMes: (competencia: string) => number;

  executarCobrancasAutomaticas: () => number;

  desvincularProfessorDeAlunos: (professorId: string) => void;
}

// ==============================

const DojoContext = createContext<DojoContextData>({
  alunos: [],
  userLogado: null,
  carregado: false,
  setUserLogado: () => {},
  login: () => null,
  logout: () => {},
  adicionarAluno: () => {},
  removerAluno: () => {},
  buscarAluno: () => undefined,
  editarAluno: () => {},
  adicionarCobranca: () => {},
  removerCobranca: () => {},
  registrarPagamento: () => {},
  marcarCobrancaComoPaga: () => {},
  gerarMensalidadesMes: () => 0,
  executarCobrancasAutomaticas: () => 0,
  desvincularProfessorDeAlunos: () => {},
});

const STORAGE_KEY = "@dojo_alunos";

// ==============================

export function DojoProvider({
  children,
}: {
  children: React.ReactNode;
}) {  
  const { professores } = useProfessores();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [userLogado, setUserLogado] = useState<UserLogado | null>(null);
  const [carregado, setCarregado] = useState(false);

  const executarCobrancasAutomaticas = useCallback(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let geradas = 0;

    setAlunos((lista) => {
      const novaLista = lista.map((aluno) => {
        if (
          !aluno.ativo ||
          aluno.mensalidade === "Isento" ||
          !aluno.proximaCobranca
        ) {
          return aluno;
        }

        const dataProximaCobranca = new Date(aluno.proximaCobranca);
        if (hoje < dataProximaCobranca) return aluno;

        const competencia = aluno.proximaCobranca.slice(0, 7);
        const [ano, mes] = competencia.split("-").map(Number);

        const valor = Number(
          aluno.valorMensalidade
            .replace(/\s/g, "")
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
        );

        if (!valor || valor <= 0) return aluno;

        const dia = Math.min(
          aluno.diaVencimento || 10,
          new Date(ano, mes, 0).getDate()
        );

        const vencimento = `${ano}-${String(mes).padStart(2, "0")}-${String(
          dia
        ).padStart(2, "0")}`;

        const proximaData = new Date(ano, mes, dia);
        proximaData.setMonth(proximaData.getMonth() + 1);

        geradas++;

        return {
          ...aluno,
          cobrancas: [
            ...aluno.cobrancas,
            { id: `${aluno.id}-${competencia}`, descricao: `Mensalidade ${competencia}`, valor, vencimento, competencia, status: "pendente" as const },
          ],
          proximaCobranca: proximaData.toISOString().slice(0, 10),
        };
      });
      return novaLista;
    });
    return geradas;
  }, []);

  // ==============================
  // LOAD
  // ==============================
  useEffect(() => {
    async function carregar() {
      try {
        const alunosApi = await getAlunos();

        if (Array.isArray(alunosApi)) {
          const alunosValidosApi = alunosApi
            .map((aluno: Partial<Aluno>): Aluno => {
              return {
                ...aluno,
                id: aluno.id || Date.now().toString(),
                nome: aluno.nome || "Nome Inválido",
                historicoGraduacao: aluno.historicoGraduacao || [],
                cobrancas: aluno.cobrancas || [],
              } as Aluno;
            })
            .filter((aluno) => aluno.nome !== "Nome Inválido");

          setAlunos(alunosValidosApi);
          setCarregado(true);
          return;
        }
      } catch (error) {
        console.warn("Falha ao carregar alunos do backend:", error);
      }

      const dados = await AsyncStorage.getItem(STORAGE_KEY);

      if (dados) {
        const listaSalva = JSON.parse(dados) as any[];

        // Validação para garantir a integridade dos dados carregados
        const alunosValidos = listaSalva.map((aluno: Partial<Aluno>): Aluno => {
          return {
            ...aluno,
            id: aluno.id || Date.now().toString(), // Garante um ID
            nome: aluno.nome || 'Nome Inválido',
            historicoGraduacao: aluno.historicoGraduacao || [], // Garante que historicoGraduacao exista
            cobrancas: aluno.cobrancas || [], // Garante que arrays existam
          } as Aluno;
        }).filter(aluno => aluno.nome !== 'Nome Inválido'); // Remove registros corrompidos

        setAlunos(alunosValidos);
      }

      setCarregado(true);
    }

    carregar();
  }, []);

  // ==============================
  // SAVE
  // ==============================
  useEffect(() => {
    if (carregado) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
    }
  }, [alunos, carregado]);

  // ==============================
  // FUNÇÕES
  // ==============================

  function adicionarAluno(aluno: Aluno) {
    setAlunos((lista) => [
      ...lista,
      {
        ...aluno, // Mantém todas as propriedades
        cobrancas: aluno.cobrancas || [],
        criadoEm: new Date().toISOString(),
        ativo: aluno.ativo ?? true,
        // Garante que a proximaCobranca seja definida se não vier do formulário
        proximaCobranca: aluno.proximaCobranca || new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  function removerAluno(id: string) {
    setAlunos((lista) => lista.filter((a) => a.id !== id));
  }

  function buscarAluno(id: string) {
    return alunos.find((a) => a.id === id);
  }

  function editarAluno(alunoAtualizado: Aluno) {
    setAlunos((lista) =>
      lista.map((a) =>
        a.id === alunoAtualizado.id ? alunoAtualizado : a
      )
    );
  }

  function desvincularProfessorDeAlunos(professorId: string) {
    setAlunos(lista =>
      lista.map(aluno => {
        if (aluno.professorId === professorId) {
          return { ...aluno, professorId: undefined };
        }
        return aluno;
      })
    );
  }

  function adicionarCobranca(alunoId: string, cobranca: Cobranca) {
    setAlunos((lista) =>
      lista.map((a) =>
        a.id === alunoId
          ? { ...a, cobrancas: [...a.cobrancas, cobranca] }
          : a
      )
    );
  }

  function removerCobranca(alunoId: string, cobrancaId: string) {
    setAlunos((lista) =>
      lista.map((a) =>
        a.id === alunoId
          ? {
              ...a,
              cobrancas: a.cobrancas.filter((c) => c.id !== cobrancaId),
            }
          : a
      )
    );
  }

  function registrarPagamento(
    alunoId: string,
    cobrancaId: string,
    pagoEm: string,
    formaPagamento: string
  ) {
    setAlunos((lista) =>
      lista.map((a) =>
        a.id === alunoId
          ? {
              ...a,
              cobrancas: a.cobrancas.map((c) =>
                c.id === cobrancaId
                  ? { ...c, pagoEm, formaPagamento, status: "pago" }
                  : c
              ),
            }
          : a
      )
    );
  }

  function marcarCobrancaComoPaga(
    alunoId: string,
    cobrancaId: string
  ) {
    const hoje = new Date().toISOString().slice(0, 10);

    setAlunos((lista) =>
      lista.map((a) =>
        a.id === alunoId
          ? {
              ...a,
              cobrancas: a.cobrancas.map((c) =>
                c.id === cobrancaId
                  ? { ...c, pagoEm: hoje, status: "pago" }
                  : c
              ),
            }
          : a
      )
    );
  }

  function gerarMensalidadesMes() {
    return 0;
  }

  // ✅ LOGIN SEM ERRO
function login(nome: string, senha: string): UserLogado | null {

  // 1. Acesso Admin do proprietário
  if (nome.toLowerCase() === "gabriel triunfo" && senha === "418221") {
    const adminUser: UserLogado = {
      id: "admin",
      nome: "Gabriel Triunfo",
      tipo: "professor",
    };
    setUserLogado(adminUser);
    return adminUser;
  }

  // 2. Acesso Professor
  const professorEncontrado = professores.find(
    (p) => p.nome.toLowerCase() === nome.toLowerCase() && p.senha === senha
  );
  if (professorEncontrado) {
    const user: UserLogado = {
      id: professorEncontrado.id,
      nome: professorEncontrado.nome,
      tipo: "professor",
    };
    setUserLogado(user);
    return user;
  }

  return null;
}

  function logout() {
    setUserLogado(null);
  }

  return (
    <DojoContext.Provider
      value={{
        alunos,
        userLogado,
        carregado,
        setUserLogado,
        login,
        logout,
        adicionarAluno,
        removerAluno,
        buscarAluno,
        editarAluno,
        adicionarCobranca,
        removerCobranca,
        registrarPagamento,
        marcarCobrancaComoPaga,
        gerarMensalidadesMes,
        executarCobrancasAutomaticas,
        desvincularProfessorDeAlunos,
      }}
    >
      {children}
    </DojoContext.Provider>
  );
}

export function useDojo() {
  return useContext(DojoContext);
}