import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Treino { id: string; nome: string; dia: string; horario: string; turma: string; professor: string; turmaId?: string; professorId?: string; }
interface TreinoContextData { treinos: Treino[]; adicionarTreino: (treino: Treino) => void; editarTreino: (treino: Treino) => void; excluirTreino: (id: string) => void; buscarTreino: (id: string) => Treino | undefined; }
const STORAGE_KEY = '@dojo_treinos';
const TreinoContext = createContext<TreinoContextData>({} as TreinoContextData);
export function TreinoProvider({ children }: { children: ReactNode }) {
  const [treinos, setTreinos] = useState<Treino[]>([]); const [carregado, setCarregado] = useState(false);
  useEffect(() => { async function carregar() { try { const dados = await AsyncStorage.getItem(STORAGE_KEY); if (dados) setTreinos(JSON.parse(dados)); } finally { setCarregado(true); } } void carregar(); }, []);
  useEffect(() => { if (carregado) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(treinos)); }, [carregado, treinos]);
  function adicionarTreino(treino: Treino) { setTreinos((lista) => [...lista, treino]); }
  function editarTreino(treino: Treino) { setTreinos((lista) => lista.map((item) => item.id === treino.id ? treino : item)); }
  function excluirTreino(id: string) { setTreinos((lista) => lista.filter((item) => item.id !== id)); }
  function buscarTreino(id: string) { return treinos.find((item) => item.id === id); }
  return <TreinoContext.Provider value={{ treinos, adicionarTreino, editarTreino, excluirTreino, buscarTreino }}>{children}</TreinoContext.Provider>;
}
export function useTreinos() { return useContext(TreinoContext); }
