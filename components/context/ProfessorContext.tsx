import {
  getProfessores,
  postProfessor,
  updateProfessor,
} from "@/services/api";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";


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

  adicionarProfessor:
    (professor: Professor) => Promise<void>;

  editarProfessor:
    (professor: Professor) => Promise<void>;

  removerProfessor:
    (id: string) => void;

  excluirProfessor:
    (id: string) => void;

  buscarProfessor:
    (id: string) => Professor | undefined;

  desvincularProfessor:
    (professorId: string) => void;

}



const ProfessorContext =
  createContext<ProfessorContextData>({
    
    professores: [],

    adicionarProfessor: async () => {},

    editarProfessor: async () => {},

    removerProfessor: () => {},

    excluirProfessor: () => {},

    buscarProfessor: () => undefined,

    desvincularProfessor: () => {},

  });



export function ProfessorProvider({
  children,
}: {
  children: ReactNode;
}) {


  const [professores, setProfessores] =
    useState<Professor[]>([]);



  /*
  ================================
  CARREGAR PROFESSORES DO POSTGRESQL
  ================================
  */


  useEffect(() => {

    async function carregar(){

      try {

        const lista =
          await getProfessores();


        setProfessores(
          lista.map((p)=>({
            ...p,
            id:String(p.id),
          }))
        );


      } catch(error){

        console.warn(
          "Erro ao carregar professores:",
          error
        );

      }

    }


    carregar();

  },[]);



  /*
  ================================
  CRIAR PROFESSOR
  ================================
  */


  async function adicionarProfessor(
    professor: Professor
  ){

    const {
      id,
      ...dados
    } = professor;


    const criado =
      await postProfessor(
        dados
      );


    setProfessores(
      lista=>[
        ...lista,
        {
          ...criado,
          id:String(criado.id)
        }
      ]
    );

  }




  /*
  ================================
  EDITAR PROFESSOR
  ================================
  */


  async function editarProfessor(
    professor: Professor
  ){

    const atualizado =
      await updateProfessor(
        professor.id,
        professor
      );


    setProfessores(
      lista=>
        lista.map(
          item=>
            item.id === professor.id
            ? atualizado
            : item
        )
    );

  }





  /*
  ================================
  REMOVER LOCAL
  ================================

  Mantido assim porque ainda
  não existe DELETE no backend.
  */

  function removerProfessor(
    id:string
  ){

    setProfessores(
      lista=>
        lista.filter(
          item=>item.id !== id
        )
    );

  }



  function excluirProfessor(
    id:string
  ){

    removerProfessor(id);

  }




  /*
  ================================
  BUSCAR
  ================================
  */


  function buscarProfessor(
    id:string
  ){

    return professores.find(
      item=>item.id === id
    );

  }





  /*
  ================================
  DESVINCULAR
  ================================
  */


  function desvincularProfessor(
    professorId:string
  ){

    setProfessores(
      lista=>
        lista.map(
          professor=>
            professor.id === professorId
            ? {
                ...professor,
                alunoId:undefined
              }
            : professor
        )
    );

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




export function useProfessores(){

  return useContext(
    ProfessorContext
  );

}