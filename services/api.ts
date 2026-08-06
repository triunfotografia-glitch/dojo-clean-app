import { Aluno, Cobranca } from '@/components/context/DojoContext';

export const API_URL = 'https://dojo-backend-ofn6.onrender.com';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorText}`,
    );
  }

  return response.json();
}

export async function getAlunos(): Promise<Aluno[]> {
  const response = await fetch(`${API_URL}/alunos`);
  return parseJson<Aluno[]>(response);
}

export async function postAluno(aluno: Omit<Aluno, 'id'>): Promise<Aluno> {
  const response = await fetch(`${API_URL}/alunos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(aluno),
  });

  return parseJson<Aluno>(response);
}

export async function getCobrancas(): Promise<Cobranca[]> {
  const response = await fetch(`${API_URL}/cobrancas`);
  return parseJson<Cobranca[]>(response);
}

export async function postCobranca(cobranca: Omit<Cobranca, 'id'>): Promise<Cobranca> {
  const response = await fetch(`${API_URL}/cobrancas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cobranca),
  });

  return parseJson<Cobranca>(response);
}
