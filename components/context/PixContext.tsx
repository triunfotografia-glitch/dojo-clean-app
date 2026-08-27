import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getPixConfig,
  onAuthLost,
  updatePixConfig,
  getPixChaves,
  getPixChavesAtivas,
  postPixChave,
  putPixChave,
  deletePixChave,
} from "@/services/api";

interface PixChave {
  id: string;
  nome_identificacao: string;
  chave_pix: string;
  tipo: string;
  descricao?: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

interface PixContextData {
  chavePix: string;
  nomeRecebedor: string;
  cidadeRecebedor: string;
  pixConfigurado: boolean;

  chavesPix: PixChave[];
  carregarChavesPix: () => Promise<void>;
  carregarTodasChavesPix: () => Promise<void>;
  salvarConfiguracaoPix: (
    chave: string,
    nome: string,
    cidade: string
  ) => Promise<void>;

  salvarChavePix: (
    chave: Omit<PixChave, "id">
  ) => Promise<PixChave>;
  editarChavePix: (
    id: string,
    chave: Partial<PixChave>
  ) => Promise<PixChave>;
  excluirChavePix: (id: string) => Promise<void>;
}

const PixContext = createContext<PixContextData>(
  {} as PixContextData
);

const STORAGE_KEY = "@dojo_pix";

export function PixProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [chavePix, setChavePix] = useState("");
  const [nomeRecebedor, setNomeRecebedor] =
    useState("DOJO LB");

  const [cidadeRecebedor, setCidadeRecebedor] =
    useState("SAO PAULO");

  const [chavesPix, setChavesPix] = useState<
    PixChave[]
  >([]);

  const pixConfigurado =
    chavePix.trim().length > 0;


  useEffect(() => {

    let ativo = true;

    async function carregar() {

      try {

        const config =
          await getPixConfig();

        if (ativo && config) {
          setChavePix(
            config.chave_pix || ""
          );

          setNomeRecebedor(
            config.nome_recebedor || "DOJO LB"
          );

          setCidadeRecebedor(
            config.cidade_recebedor || "SAO PAULO"
          );
        }

      } catch {

        try {

          const dados =
            await AsyncStorage.getItem(
              STORAGE_KEY
            );

          if (!dados || !ativo) return;

          const configuracao =
            JSON.parse(dados);

          if (!ativo) return;

          setChavePix(
            configuracao.chavePix || ""
          );

          setNomeRecebedor(
            configuracao.nomeRecebedor ||
            "DOJO LB"
          );

          setCidadeRecebedor(
            configuracao.cidadeRecebedor ||
            "SAO PAULO"
          );

        } catch (error) {

          if (ativo) {
            console.log(
              "Erro carregar PIX",
              error
            );
          }

        }

      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  async function carregarChavesPix() {
    try {
      const chaves =
        await getPixChavesAtivas();

      setChavesPix(chaves);
    } catch (error) {
      console.error(
        "Erro ao carregar chaves PIX:",
        error
      );
    }
  }

  const carregarTodasChavesPix = useCallback(async () => {
    try {
      const chaves =
        await getPixChaves();

      setChavesPix(chaves);
    } catch (error) {
      console.error(
        "Erro ao carregar chaves PIX:",
        error
      );
    }
  }, []);

  // ==============================
  // AUTH LOSS LISTENER
  // ==============================

  useEffect(() => {
    const cleanup = onAuthLost(() => {
      setChavePix("");
      setNomeRecebedor("DOJO LB");
      setCidadeRecebedor("SAO PAULO");
      setChavesPix([]);
    });

    return cleanup;
  }, []);


  async function salvarConfiguracaoPix(
    chave:string,
    nome:string,
    cidade:string
  ){

    const configuracao = {

      chavePix:
        chave.trim(),

      nomeRecebedor:
        nome.trim() || "DOJO LB",

      cidadeRecebedor:
        cidade.trim() || "SAO PAULO",

    };


    setChavePix(
      configuracao.chavePix
    );


    setNomeRecebedor(
      configuracao.nomeRecebedor
    );


    setCidadeRecebedor(
      configuracao.cidadeRecebedor
    );

    try {

      await updatePixConfig({
        chave_pix: configuracao.chavePix,
        nome_recebedor: configuracao.nomeRecebedor,
        cidade_recebedor: configuracao.cidadeRecebedor,
      });

    } catch (error) {

      console.error(
        "Erro ao salvar PIX no backend:",
        error
      );

    } finally {

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(configuracao)
      );

    }

  }

  async function salvarChavePix(
    chave: Omit<PixChave, "id">
  ): Promise<PixChave> {
    const nova = await postPixChave(chave);
    setChavesPix((prev) => [...prev, nova]);
    return nova;
  }

  async function editarChavePix(
    id: string,
    chave: Partial<PixChave>
  ): Promise<PixChave> {
    const atualizada = await putPixChave(id, chave);
    setChavesPix((prev) =>
      prev.map((item) =>
        item.id === id ? atualizada : item
      )
    );
    return atualizada;
  }

  async function excluirChavePix(id: string): Promise<void> {
    await deletePixChave(id);
    setChavesPix((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }


  return (

    <PixContext.Provider

      value={

        {
          chavePix,

          nomeRecebedor,

          cidadeRecebedor,

          pixConfigurado,

          chavesPix,

          carregarChavesPix,

          carregarTodasChavesPix,

          salvarConfiguracaoPix,

          salvarChavePix,

          editarChavePix,

          excluirChavePix,

        }

      }
    >

      {children}

    </PixContext.Provider>

  );

}



export function usePix(){

  return useContext(
    PixContext
  );

}
