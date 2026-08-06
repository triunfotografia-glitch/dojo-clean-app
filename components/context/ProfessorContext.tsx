import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Professor {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  telefone?: string;
  faixa: string;
  graus?: number;
  especialidade: string;
  ativo: boolean;
  alunoId?: string;
}

interface ProfessorContextData {
  professores: Professor[];
  adicionarProfessor: (professor: Professor) => void;
  editarProfessor: (professor: Professor) => void;
  removerProfessor: (id: string) => void;
  excluirProfessor: (id: string) => void;
  buscarProfessor: (id: string) => Professor | undefined;
  desvincularProfessor: (professorId: string) => void;
}

const STORAGE_KEY = '@dojo_professores';
const ProfessorContext = createContext<ProfessorContextData>({
  professores: [],
  adicionarProfessor: () => {},
  editarProfessor: () => {},
  removerProfessor: () => {},
  excluirProfessor: () => {},
  buscarProfessor: () => undefined,
  desvincularProfessor: () => {},
});

export function ProfessorProvider({ children }: { children: ReactNode }) {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await AsyncStorage.getItem(STORAGE_KEY);
        if (dados) {
          setProfessores(JSON.parse(dados));
        }
      } finally {
        setCarregado(true);
      }
    }

    void carregar();
  }, []);

  useEffect(() => {
    if (carregado) {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(professores));
    }
  }, [carregado, professores]);

  function adicionarProfessor(professor: Professor) {
    setProfessores((lista) => [...lista, professor]);
  }

  function editarProfessor(professor: Professor) {
    setProfessores((lista) =>
      lista.map((item) => (item.id === professor.id ? professor : item)),
    );
  }

  function removerProfessor(id: string) {
    setProfessores((lista) => lista.filter((item) => item.id !== id));
  }

  function excluirProfessor(id: string) {
    setProfessores((lista) => lista.filter((item) => item.id !== id));
  }

  function desvincularProfessor(professorId: string) {
    // Esta função será implementada no DojoContext para evitar dependência cruzada
  }

  function buscarProfessor(id: string) {
    return professores.find((item) => item.id === id);
  }

  return (
    <ProfessorContext.Provider
      value={{
        professores,
        adicionarProfessor,
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

export function useProfessores() {
  return useContext(ProfessorContext);
}
