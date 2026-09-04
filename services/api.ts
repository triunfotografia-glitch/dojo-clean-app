import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  Aluno,
  Cobranca,
  Graduacao,
} from "@/components/context/DojoContext";

import type {
  Professor,
} from "@/components/context/ProfessorContext";

import type {
  Presenca,
} from "@/components/context/PresencaContext";

import type {
  Treino,
} from "@/components/context/TreinoContext";

import type {
  Turma,
} from "@/components/context/TurmaContext";

import { notifyAuthLost, onAuthLost, notifyAuthChanged, onAuthChanged } from "./authEvents";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.status = status;
  }
}

export {
  ApiError,
  notifyAuthLost,
  onAuthLost,
  notifyAuthChanged,
  onAuthChanged,
};

const FALLBACK_API_URL_DEV = "http://192.168.15.64:3000";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (__DEV__ ? FALLBACK_API_URL_DEV : undefined);

const TOKEN_KEY = "@dojo_lb:jwt";

const TIMEOUT_MS = 15000;

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {

  const token =
    await getToken();

  const headers: Record<
    string,
    string
  > = {
    ...(options.headers as Record<
      string,
      string
    > || {}),
  };

  if (
    !headers["Content-Type"] &&
    !headers["content-type"]
  ) {

    headers["Content-Type"] =
      "application/json";

  }

  if (!token) {

    throw new ApiError(
      401,
      "Token de autenticação não informado."
    );

  }

  headers.Authorization =
    `Bearer ${token}`;

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

  try {

    const response =
      await fetch(
        url,
        {
          ...options,
          headers,
          signal:
            controller.signal,
        }
      );

    if (
      response.status === 401
    ) {

      await removeToken();

      notifyAuthLost();

    }

    return await parseJson<T>(
      response
    );

  } catch (error) {

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {

      throw new Error(
        "A requisição excedeu o tempo limite."
      );

    }

    throw error;

  } finally {

    clearTimeout(
      timeoutId
    );

  }

}

// ==============================
// TYPES
// ==============================

export interface LoginResponse {
  sucesso: boolean;
  token: string;
  professor: Professor;
}

export interface PixConfig {
  chave_pix: string;
  nome_recebedor: string;
  cidade_recebedor: string;
}

export interface PixChave {
  id: string;
  nome_identificacao: string;
  chave_pix: string;
  tipo: string;
  descricao?: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Campeonato {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  cidade: string;
  estado: string;
  local: string;
  organizacao: string;
  url: string;
  fonte: string;
}

// ==============================
// TOKEN
// ==============================

export async function saveToken(
  token: string
): Promise<void> {
  await AsyncStorage.setItem(
    TOKEN_KEY,
    token
  );
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(
    TOKEN_KEY
  );
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(
    TOKEN_KEY
  );
}

export async function hasToken(): Promise<boolean> {
  const token = await getToken();

  return !!token;
}

export function isTokenExpired(
  token: string
): boolean {
  try {

    const payload = JSON.parse(
      atob(
        token.split('.')[1]
      )
    );

    return payload.exp
      ? payload.exp * 1000 <
          Date.now()
      : true;

  } catch {

    return true;

  }
}

// ==============================
// CONVERSÃO SNAKE -> CAMEL
// ==============================

function snakeToCamelKey(
  key: string
): string {
  return key.replace(
    /_([a-z])/g,
    (_, letter) =>
      letter.toUpperCase()
  );
}

function convertKeysToCamelCase(
  value: any
): any {

  if (Array.isArray(value)) {
    return value.map(
      convertKeysToCamelCase
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {

    const result: Record<
      string,
      any
    > = {};

    Object.entries(value).forEach(
      ([key, val]) => {

        result[
          snakeToCamelKey(key)
        ] =
          convertKeysToCamelCase(
            val
          );

      }
    );

    return result;
  }

  return value;
}

// ==============================
// CONVERSÃO CAMEL -> SNAKE
// ==============================

function camelToSnakeKey(
  key: string
): string {
  return key.replace(
    /[A-Z]/g,
    (letter) =>
      `_${letter.toLowerCase()}`
  );
}

function convertKeysToSnakeCase(
  value: any
): any {

  if (Array.isArray(value)) {
    return value.map(
      convertKeysToSnakeCase
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {

    const result: Record<
      string,
      any
    > = {};

    Object.entries(value).forEach(
      ([key, val]) => {

        result[
          camelToSnakeKey(key)
        ] =
          convertKeysToSnakeCase(
            val
          );

      }
    );

    return result;
  }

  return value;
}

// ==============================
// PARSE JSON
// ==============================

async function parseJson<T>(
  response: Response
): Promise<T> {

  const text =
    await response.text();

  let data: any = null;

  try {

    data =
      text
        ? JSON.parse(text)
        : null;

  } catch {

    throw new Error(
      `Resposta inválida do servidor: ${text}`
    );

  }

  if (!response.ok) {

    const mensagem =
      data?.error ||
      data?.message ||
      `Erro HTTP ${response.status}`;

    throw new ApiError(
      response.status,
      mensagem
    );

  }

  return convertKeysToCamelCase(
    data
  ) as T;
}

// ==============================
// HEADERS JSON
// ==============================

function jsonHeaders(): Record<
  string,
  string
> {

  return {
    "Content-Type":
      "application/json",
  };

}

// ==============================
// LOGIN PROFESSOR
// ==============================

export async function loginProfessor(
  nome: string,
  senha: string
): Promise<LoginResponse> {

  const response =
    await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",

        headers:
          jsonHeaders(),

        body:
          JSON.stringify({
            nome: nome.trim(),
            senha,
          }),
      }
    );

  const data =
    await parseJson<any>(
      response
    );

  // ============================
  // VALIDAR RESPOSTA
  // ============================

  if (
    !data ||
    data.sucesso !== true
  ) {

    throw new Error(
      data?.error ||
      "Login não autorizado."
    );

  }

  if (
    !data.token ||
    typeof data.token !== "string"
  ) {

    throw new Error(
      "Login realizado, mas o servidor não retornou um token JWT."
    );

  }

  if (
    !data.professor
  ) {

    throw new Error(
      "Servidor não retornou os dados do professor."
    );

  }

  await saveToken(
    data.token
  );

  return data as LoginResponse;
}

// ==============================
// LOGOUT
// ==============================

export async function logoutProfessor(): Promise<void> {

  await removeToken();

}

//// ==============================
// RECUPERAÇÃO DE SENHA
// ==============================

export interface EsqueciSenhaResponse {
  mensagem: string;
}

export interface RedefinirSenhaResponse {
  mensagem: string;
}

export interface ValidarOtpResponse {
  success: boolean;
  resetToken?: string;
  message?: string;
}

export async function esqueciSenha(
  email: string
): Promise<EsqueciSenhaResponse> {

  const response = await fetch(
    `${API_URL}/auth/esqueci-senha`,
    {
      method: "POST",

      headers: jsonHeaders(),

      body: JSON.stringify({
        email: email.trim(),
      }),
    }
  );

  return parseJson<EsqueciSenhaResponse>(
    response
  );
}

export async function redefinirSenha(
  token: string,
  novaSenha: string
): Promise<RedefinirSenhaResponse> {

  const response = await fetch(
    `${API_URL}/auth/redefinir-senha`,
    {
      method: "POST",

      headers: jsonHeaders(),

      body: JSON.stringify({
        resetToken: token.trim(),
        nova_senha: novaSenha,
      }),
    }
  );

  return parseJson<RedefinirSenhaResponse>(
    response
  );
}

export async function solicitarRecuperacaoEmail(
  email: string
): Promise<EsqueciSenhaResponse> {

  const response = await fetch(
    `${API_URL}/auth/solicitar-recuperacao-email`,
    {
      method: "POST",

      headers: jsonHeaders(),

      body: JSON.stringify({
        email: email.trim(),
      }),
    }
  );

  return parseJson<EsqueciSenhaResponse>(
    response
  );
}

export async function solicitarRecuperacaoWhatsApp(
  telefone: string
): Promise<EsqueciSenhaResponse> {

  const response = await fetch(
    `${API_URL}/auth/solicitar-recuperacao-whatsapp`,
    {
      method: "POST",

      headers: jsonHeaders(),

      body: JSON.stringify({
        telefone: telefone.trim(),
      }),
    }
  );

  return parseJson<EsqueciSenhaResponse>(
    response
  );
}

export async function validarOtpEmail(
  email: string,
  codigo: string
): Promise<ValidarOtpResponse> {

  const response = await fetch(
    `${API_URL}/auth/validar-otp`,
    {
      method: "POST",

      headers: jsonHeaders(),

      body: JSON.stringify({
        email: email.trim(),
        codigo: codigo.trim(),
      }),
    }
  );

  return parseJson<ValidarOtpResponse>(
    response
  );
}

export async function validarOtp(
  telefone: string,
  codigo: string
): Promise<ValidarOtpResponse> {

  const response = await fetch(
    `${API_URL}/auth/validar-otp`,
    {
      method: "POST",

      headers: jsonHeaders(),

      body: JSON.stringify({
        telefone: telefone.trim(),
        codigo: codigo.trim(),
      }),
    }
  );

  return parseJson<ValidarOtpResponse>(
    response
  );
}

// ==============================
// ALUNOS
// ==============================

export async function getAlunos(): Promise<Aluno[]> {

  return request<Aluno[]>(
    `${API_URL}/alunos`
  );

}

export async function postAluno(
  aluno: Omit<Aluno, "id">
): Promise<Aluno> {

  const payload =
    convertKeysToSnakeCase(
      aluno
    );

  return request<Aluno>(
    `${API_URL}/alunos`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function updateAluno(
  id: string,
  aluno: Partial<Aluno>
): Promise<Aluno> {

  const payload =
    convertKeysToSnakeCase(
      aluno
    );

  return request<Aluno>(
    `${API_URL}/alunos/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function deleteAluno(
  id: string
): Promise<void> {

  await request<void>(
    `${API_URL}/alunos/${id}`,
    {
      method: "DELETE",
      headers: jsonHeaders(),
    }
  );

}

// ==============================
// COBRANÇAS
// ==============================

export async function getCobrancas(): Promise<Cobranca[]> {

  return request<Cobranca[]>(
    `${API_URL}/cobrancas`
  );

}

export async function postCobranca(
  cobranca: Omit<Cobranca, "id">
): Promise<Cobranca> {

  const payload =
    convertKeysToSnakeCase(
      cobranca
    );

  return request<Cobranca>(
    `${API_URL}/cobrancas`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function updateCobranca(
  id: string,
  cobranca: Partial<Cobranca>
): Promise<Cobranca> {

  const payload =
    convertKeysToSnakeCase(
      cobranca
    );

  return request<Cobranca>(
    `${API_URL}/cobrancas/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function deleteCobranca(
  id: string
): Promise<void> {

  await request<void>(
    `${API_URL}/cobrancas/${id}`,
    {
      method: "DELETE",
      headers: jsonHeaders(),
    }
  );

}

// ==============================
// PROFESSORES
// ==============================

export async function getProfessores(): Promise<Professor[]> {

  return request<Professor[]>(
    `${API_URL}/professores`
  );

}

// ==============================
// CRIAR PROFESSOR
// ==============================

export async function postProfessor(
  professor: Omit<Professor, "id">
): Promise<Professor> {

  const payload =
    convertKeysToSnakeCase(
      professor
    );

  return request<Professor>(
    `${API_URL}/professores`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

// ==============================
// ATUALIZAR PROFESSOR
// ==============================

export async function updateProfessor(
  id: string,
  professor: Partial<Professor>
): Promise<Professor> {

  const { temSenha, ...rest } = professor;

  const payload =
    convertKeysToSnakeCase(
      rest
    );

  return request<Professor>(
    `${API_URL}/professores/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),

    }
  );

}

// ==============================
// DELETAR PROFESSOR
// ==============================

export async function deleteProfessor(
  id: string
): Promise<void> {

  await request<void>(
    `${API_URL}/professores/${id}`,
    {
      method: "DELETE",
      headers: jsonHeaders(),
    }
  );

}

// ==============================
// TURMAS
// ==============================

export async function getTurmas(): Promise<Turma[]> {

  return request<Turma[]>(
    `${API_URL}/turmas`
  );

}

export async function deleteTurma(
  id: string
): Promise<void> {

  await request<void>(
    `${API_URL}/turmas/${id}`,
    {
      method: "DELETE",
      headers: jsonHeaders(),
    }
  );

}

export async function postTurma(
  turma: Omit<Turma, "id">
): Promise<Turma> {

  const payload =
    convertKeysToSnakeCase(
      turma
    );

  return request<Turma>(
    `${API_URL}/turmas`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function updateTurma(
  id: string,
  turma: Partial<Turma>
): Promise<Turma> {

  const payload =
    convertKeysToSnakeCase(
      turma
    );

  return request<Turma>(
    `${API_URL}/turmas/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

// ==============================
// TREINOS
// ==============================

export async function getTreinos(): Promise<Treino[]> {

  return request<Treino[]>(
    `${API_URL}/treinos`
  );

}

export async function postTreino(
  treino: Omit<Treino, "id">
): Promise<Treino> {

  const payload =
    convertKeysToSnakeCase(
      treino
    );

  return request<Treino>(
    `${API_URL}/treinos`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function getTreino(
  id: string | number
): Promise<Treino> {

  return request<Treino>(
    `${API_URL}/treinos/${id}`
  );

}

export async function putTreino(
  id: string | number,
  treino: Partial<Treino>
): Promise<Treino> {

  const payload =
    convertKeysToSnakeCase(
      treino
    );

  return request<Treino>(
    `${API_URL}/treinos/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function deleteTreino(
  id: string | number
): Promise<void> {

  await request<void>(
    `${API_URL}/treinos/${id}`,
    {
      method: "DELETE",
    }
  );

}

// PRESENÇAS
// ==============================

export async function getPresencas(): Promise<Presenca[]> {

  return request<Presenca[]>(
    `${API_URL}/presencas`
  );

}

export async function postPresenca(
  presenca: Omit<Presenca, "id">
): Promise<Presenca> {

  const payload =
    convertKeysToSnakeCase(
      presenca
    );

  return request<Presenca>(
    `${API_URL}/presencas`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function getPresencasPorTreino(
  treinoId: string | number,
  data?: string
): Promise<Presenca[]> {

  const base =
    `${API_URL}/presencas/treino/${treinoId}`;

  const url =
    data
      ? `${base}?data=${encodeURIComponent(data)}`
      : base;

  return request<Presenca[]>(
    url
  );

}

export async function putPresenca(
  id: string | number,
  dados: Partial<Presenca>
): Promise<Presenca> {

  const payload =
    convertKeysToSnakeCase(
      dados
    );

  return request<Presenca>(
    `${API_URL}/presencas/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),
    }
  );

}

export async function deletePresenca(
  id: string | number
): Promise<void> {

  return request<void>(
    `${API_URL}/presencas/${id}`,
    {
      method: "DELETE",
      headers: jsonHeaders(),
    }
  );

}

// ==============================
// GRADUAÇÕES
// ==============================

export async function getGraduacoes(): Promise<Graduacao[]> {

  return request<Graduacao[]>(
    `${API_URL}/graduacoes`
  );

}

export async function getGraduacao(
  id: string | number
): Promise<Graduacao> {

  return request<Graduacao>(
    `${API_URL}/graduacoes/${id}`
  );

}

export async function postGraduacao(
  graduacao: Omit<Graduacao, "id">
): Promise<Graduacao> {

  const payload =
    convertKeysToSnakeCase(
      graduacao
    );

  return request<Graduacao>(
    `${API_URL}/graduacoes`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),

    }
  );

}

export async function putGraduacao(
  id: string,
  graduacao: Partial<Graduacao>
): Promise<Graduacao> {

  const payload =
    convertKeysToSnakeCase(
      graduacao
    );

  return request<Graduacao>(
    `${API_URL}/graduacoes/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),

    }
  );

}

export async function deleteGraduacao(
  id: string
): Promise<void> {

  await request<void>(
    `${API_URL}/graduacoes/${id}`,
    {
      method: "DELETE",

      headers:
        jsonHeaders(),

    }
  );

}

// ==============================
// PIX
// ==============================

export async function getPixConfig(): Promise<PixConfig> {

  return request<PixConfig>(
    `${API_URL}/pix`
  );

}

export async function updatePixConfig(
  dados: Partial<PixConfig>
): Promise<PixConfig> {

  const payload =
    convertKeysToSnakeCase(
      dados
    );

  return request<PixConfig>(
    `${API_URL}/pix`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),

    }
  );

}

export async function getPixChaves(): Promise<PixChave[]> {

  return request<PixChave[]>(
    `${API_URL}/pix/chaves`
  );

}

export async function getPixChavesAtivas(): Promise<PixChave[]> {

  return request<PixChave[]>(
    `${API_URL}/pix/chaves/ativas`
  );

}

export async function postPixChave(
  chave: Omit<PixChave, "id">
): Promise<PixChave> {

  const payload =
    convertKeysToSnakeCase(
      chave
    );

  return request<PixChave>(
    `${API_URL}/pix/chaves`,
    {
      method: "POST",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),

    }
  );

}

export async function putPixChave(
  id: string,
  chave: Partial<PixChave>
): Promise<PixChave> {

  const payload =
    convertKeysToSnakeCase(
      chave
    );

  return request<PixChave>(
    `${API_URL}/pix/chaves/${id}`,
    {
      method: "PUT",

      headers:
        jsonHeaders(),

      body:
        JSON.stringify(
          payload
        ),

    }
  );

}

export async function deletePixChave(
  id: string
): Promise<void> {

  await request<void>(
    `${API_URL}/pix/chaves/${id}`,
    {
      method: "DELETE",

      headers:
        jsonHeaders(),

    }
  );

}

export async function getCampeonatos(): Promise<Campeonato[]> {
  return request<Campeonato[]>(
    `${API_URL}/campeonatos`
  );
}
