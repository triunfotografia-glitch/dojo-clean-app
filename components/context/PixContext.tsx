import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getPixConfig,
  onAuthLost,
  updatePixConfig,
} from "@/services/api";

interface PixContextData {
  chavePix: string;
  nomeRecebedor: string;
  cidadeRecebedor: string;
  pixConfigurado: boolean;

  salvarConfiguracaoPix: (
    chave: string,
    nome: string,
    cidade: string
  ) => Promise<void>;
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

  // ==============================
  // AUTH LOSS LISTENER
  // ==============================

  useEffect(() => {
    const cleanup = onAuthLost(() => {
      setChavePix("");
      setNomeRecebedor("DOJO LB");
      setCidadeRecebedor("SAO PAULO");
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


  return (

    <PixContext.Provider

      value={

        {
          chavePix,

          nomeRecebedor,

          cidadeRecebedor,

          pixConfigurado,

          salvarConfiguracaoPix,

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
