import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Turma {
  id: string;
  nome: string;
  professorId: string;
  alunoIds: string[];
}

interface TurmaContextData {
  turmas: Turma[];
  adicionarTurma: (turma: Turma) => void;
  excluirTurma: (id: string) => void;
}

const STORAGE_KEY = '@dojo_turmas';
const TurmaContext = createContext<TurmaContextData>({} as TurmaContextData);

export function TurmaProvider({ children }: { children: ReactNode }) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await AsyncStorage.getItem(STORAGE_KEY);
        if (dados) setTurmas(JSON.parse(dados));
      } finally {
        setCarregado(true);
      }
    }
    void carregar();
  }, []);

  useEffect(() => {
    if (carregado) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(turmas));
  }, [carregado, turmas]);

  function adicionarTurma(turma: Turma) {
    setTurmas((lista) => [...lista, turma]);
  }

  function excluirTurma(id: string) {
    setTurmas((lista) => lista.filter((turma) => turma.id !== id));
  }

  return (
    <TurmaContext.Provider value={{ turmas, adicionarTurma, excluirTurma }}>
      {children}
    </TurmaContext.Provider>
  );
}

export function useTurmas() {
  return useContext(TurmaContext);
}
