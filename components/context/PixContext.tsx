import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface PixContextData {
  chavePix: string;
  nomeRecebedor: string;
  cidadeRecebedor: string;
  pixConfigurado: boolean;

  salvarConfiguracaoPix: (
    chave: string,
    nome: string,
    cidade: string
  ) => void;
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

    async function carregar() {

      try {

        const dados =
          await AsyncStorage.getItem(STORAGE_KEY);


        if (!dados) return;


        const configuracao =
          JSON.parse(dados);


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


      } catch(error){

        console.log(
          "Erro carregar PIX",
          error
        );

      }

    }


    carregar();

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


    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(configuracao)
    );

  }



  return (

    <PixContext.Provider

      value={{

        chavePix,

        nomeRecebedor,

        cidadeRecebedor,

        pixConfigurado,

        salvarConfiguracaoPix,

      }}

    >

      {children}

    </PixContext.Provider>

  );

}



export function usePix(){

  return useContext(PixContext);

}