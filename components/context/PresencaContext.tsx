import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type StatusPresenca = 'presente' | 'falta' | 'justificado';

export interface Presenca {
  treinoId: string;
  alunoId: string;
  data: string;
  status: StatusPresenca;
}

interface PresencaContextData {
  presencas: Presenca[];
  registrarPresenca: (presenca: Presenca) => void;
}

const STORAGE_KEY = '@dojo_presencas';
const PresencaContext = createContext<PresencaContextData>({} as PresencaContextData);

export function PresencaProvider({ children }: { children: ReactNode }) {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await AsyncStorage.getItem(STORAGE_KEY);
        if (dados) setPresencas(JSON.parse(dados));
      } finally {
        setCarregado(true);
      }
    }
    void carregar();
  }, []);

  useEffect(() => {
    if (carregado) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(presencas));
  }, [carregado, presencas]);

  function registrarPresenca(presenca: Presenca) {
    setPresencas((lista) => {
      const existe = lista.some((item) =>
        item.treinoId === presenca.treinoId && item.alunoId === presenca.alunoId && item.data === presenca.data,
      );
      return existe
        ? lista.map((item) =>
            item.treinoId === presenca.treinoId && item.alunoId === presenca.alunoId && item.data === presenca.data
              ? presenca
              : item,
          )
        : [...lista, presenca];
    });
  }

  return <PresencaContext.Provider value={{ presencas, registrarPresenca }}>{children}</PresencaContext.Provider>;
}

export function usePresencas() {
  return useContext(PresencaContext);
}
