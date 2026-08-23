import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  Aluno,
  Cobranca,
} from "@/components/context/DojoContext";

import type {
  Professor,
} from "@/components/context/ProfessorContext";

// ==============================
// BACKEND POSTGRESQL
// ==============================

// Prioridade: EXPO_PUBLIC_API_URL (definida em .env ou nas envs do build/EAS)
// Fallback: IP da rede local, só para dev quando a env não está definida.
// Isso evita que o app quebre ao trocar de rede ou ao gerar build de produção
// sem configurar a variável — mas o ideal é sempre definir EXPO_PUBLIC_API_URL.
const FALLBACK_API_URL_DEV = "http://192.168.15.64:3000";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL_DEV;

console.log(
  '[API] API_URL efetiva:',
  API_URL
);

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    "[api] EXPO_PUBLIC_API_URL não definida — usando fallback local:",
    FALLBACK_API_URL_DEV,
    "\nDefina EXPO_PUBLIC_API_URL no arquivo .env para evitar isso."
  );
}

// ==============================
// JWT
// ==============================

const TOKEN_KEY = "@dojo_lb:jwt";

// ==============================
// TYPES
// ==============================

export interface LoginResponse {
  sucesso: boolean;
  token: string;
  professor: Professor;
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

    throw new Error(
      mensagem
    );

  }

  return convertKeysToCamelCase(
    data
  ) as T;
}

// ==============================
// REQUEST AUTENTICADO
// ==============================

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

  // ============================
  // JWT OBRIGATÓRIO
  // ============================

  if (!token) {

    throw new Error(
      "Token de autenticação não informado."
    );

  }

  headers.Authorization =
    `Bearer ${token}`;

  const response =
    await fetch(
      url,
      {
        ...options,
        headers,
      }
    );

  // ============================
  // TOKEN INVÁLIDO / EXPIRADO
  // ============================

  if (
    response.status === 401
  ) {

    await removeToken();

  }

  return parseJson<T>(
    response
  );
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

  // ============================
  // SALVAR JWT
  // ============================

  await saveToken(
    data.token
  );

  console.log(
    "JWT salvo com sucesso."
  );

  return data as LoginResponse;
}

// ==============================
// LOGOUT
// ==============================

export async function logoutProfessor(): Promise<void> {

  await removeToken();

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

  console.log('[FRONTEND updateProfessor] id:', id);
  console.log('[FRONTEND updateProfessor] professor keys:', Object.keys(professor));
  console.log('[FRONTEND updateProfessor] senha recebida:', typeof professor.senha === 'string' ? 'SIM' : 'NAO');
  console.log('[FRONTEND updateProfessor] senha length:', typeof professor.senha === 'string' ? professor.senha.length : 'N/A');

  const payload =
    convertKeysToSnakeCase(
      professor
    );

  console.log('[FRONTEND updateProfessor] payload keys:', Object.keys(payload));
  console.log('[FRONTEND updateProfessor] payload.senha existe:', 'senha' in payload);
  console.log('[FRONTEND updateProfessor] payload.senha length:', typeof payload.senha === 'string' ? payload.senha.length : 'N/A');
  console.log('[FRONTEND updateProfessor] URL:', `${API_URL}/professores/${id}`);

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

export async function getTurmas(): Promise<any[]> {

  return request<any[]>(
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

}export async function postTurma(
  turma: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      turma
    );

  return request<any>(
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


// ==============================
// ATUALIZAR TURMA
// ==============================

export async function updateTurma(
  id: string,
  turma: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      turma
    );

  return request<any>(
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

export async function getTreinos(): Promise<any[]> {

  return request<any[]>(
    `${API_URL}/treinos`
  );

}

export async function postTreino(
  treino: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      treino
    );

  return request<any>(
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

// ==============================

export async function getTreino(
  id: string | number
): Promise<any> {

  return request<any>(
    `${API_URL}/treinos/${id}`
  );

}

export async function putTreino(
  id: string | number,
  treino: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      treino
    );

  return request<any>(
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

  await request<any>(
    `${API_URL}/treinos/${id}`,
    {
      method: "DELETE",
    }
  );

}
// PRESENÇAS
// ==============================

export async function getPresencas(): Promise<any[]> {

  return request<any[]>(
    `${API_URL}/presencas`
  );

}

export async function postPresenca(
  presenca: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      presenca
    );

  return request<any>(
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
): Promise<any[]> {

  const base =
    `${API_URL}/presencas/treino/${treinoId}`;

  const url =
    data
      ? `${base}?data=${encodeURIComponent(data)}`
      : base;

  return request<any[]>(
    url
  );

}

export async function putPresenca(
  id: string | number,
  dados: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      dados
    );

  return request<any>(
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

  const token =
    await getToken();

  if (!token) {
    throw new Error(
      "Token de autenticação não informado."
    );
  }

  const response =
    await fetch(
      `${API_URL}/presencas/${id}`,
      {
        method: "DELETE",

        headers: {
          ...jsonHeaders(),

          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    let errorMessage =
      `Erro ao excluir presença. (status: ${response.status})`;

    try {
      const json =
        JSON.parse(
          text
        );

      errorMessage =
        json.error || errorMessage;
    } catch {
      errorMessage =
        text || errorMessage;
    }

    throw new Error(
      errorMessage
    );
  }

}

// ==============================
// GRADUAÇÕES
// ==============================

export async function getGraduacoes(): Promise<any[]> {

  return request<any[]>(
    `${API_URL}/graduacoes`
  );

}

export async function postGraduacao(
  graduacao: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      graduacao
    );

  return request<any>(
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

// ==============================
// PIX
// ==============================

export async function getPixConfig(): Promise<any> {

  return request<any>(
    `${API_URL}/pix`
  );

}

export async function updatePixConfig(
  dados: any
): Promise<any> {

  const payload =
    convertKeysToSnakeCase(
      dados
    );

  return request<any>(
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

export async function getCampeonatos(): Promise<any[]> {
  return request<any[]>(
    `${API_URL}/campeonatos`
  );
}
