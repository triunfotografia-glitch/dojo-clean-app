import { COLORS } from "@/components/Colors";
import { useDojo } from "@/components/context/DojoContext";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";


type CobrancaItem = {
  id: string;
  valor: number;
  vencimento: string;
  pagoEm?: string;
};


export default function CobrancasAluno() {

  const { id } =
    useLocalSearchParams<{ id: string }>();


  const {
    alunos,
    marcarCobrancaComoPaga,
  } = useDojo();



  const aluno =
    alunos.find(
      (a) => a.id === id
    );



  if (!aluno) {

    return (
      <View style={styles.container}>

        <Text style={styles.erro}>
          Aluno não encontrado
        </Text>

      </View>
    );

  }



  const hoje =
    new Date()
      .toISOString()
      .slice(0, 10);



  function status(
    cobranca:CobrancaItem
  ){

    if(cobranca.pagoEm){

      return "Pago";

    }


    if(
      cobranca.vencimento < hoje
    ){

      return "Atrasado";

    }


    return "Pendente";

  }



  function corStatus(
    cobranca:CobrancaItem
  ){

    if(cobranca.pagoEm){

      return "#37D67A";

    }


    if(
      cobranca.vencimento < hoje
    ){

      return "#FF6B6B";

    }


    return "#FFB000";

  }



  return (

    <View style={styles.container}>


      <Text style={styles.titulo}>
        Cobranças
      </Text>


      <Text style={styles.nome}>
        {aluno.nome}
      </Text>



      <FlatList

        data={
          aluno.cobrancas || []
        }


        keyExtractor={
          (item) => item.id
        }


        ListEmptyComponent={

          <Text style={styles.vazio}>
            Nenhuma cobrança registrada.
          </Text>

        }



        renderItem={

          ({item}) => (

            <View style={styles.card}>


              <Text style={styles.valor}>

                {item.valor.toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL"
                  }
                )}

              </Text>



              <Text style={styles.texto}>
                Vencimento: {item.vencimento}
              </Text>



              <Text
                style={[
                  styles.status,
                  {
                    color:
                    corStatus(item)
                  }
                ]}
              >

                {status(item)}

              </Text>



              {
                !item.pagoEm &&

                (

                  <Pressable

                    style={styles.botao}

                    onPress={async () => {
                      try {
                        await marcarCobrancaComoPaga(
                          aluno.id,
                          item.id
                        );
                      } catch (error) {
                        console.error('Erro ao marcar cobrança como paga:', error);
                        Alert.alert(
                          'Erro',
                          error instanceof Error
                            ? error.message
                            : 'Não foi possível marcar a cobrança como paga. Tente novamente.'
                        );
                      }
                    }}

                  >

                    <Text style={styles.botaoTexto}>
                      Marcar como pago
                    </Text>


                  </Pressable>

                )

              }



            </View>

          )

        }

      />


    </View>

  );

}



const styles = StyleSheet.create({

  container:{

    flex:1,

    backgroundColor:
      COLORS.background,

    padding:25,

  },


  titulo:{

    color:
      COLORS.white,

    fontSize:28,

    fontWeight:"bold",

  },


  nome:{

    color:
      COLORS.muted,

    fontSize:16,

    marginTop:6,

    marginBottom:20,

  },


  card:{

    backgroundColor:
      COLORS.card,

    borderColor:
      COLORS.border,

    borderWidth:1,

    borderRadius:15,

    padding:16,

    marginBottom:12,

  },


  valor:{

    color:
      COLORS.white,

    fontSize:20,

    fontWeight:"bold",

  },


  texto:{

    color:
      COLORS.textSecondary,

    marginTop:8,

  },


  status:{

    marginTop:10,

    fontWeight:"bold",

  },


  botao:{

    backgroundColor:
      COLORS.primary,

    marginTop:15,

    padding:12,

    borderRadius:10,

    alignItems:"center",

  },


  botaoTexto:{

    color:
      COLORS.white,

    fontWeight:"bold",

  },


  vazio:{

    color:
      COLORS.muted,

    marginTop:20,

  },


  erro:{

    color:
      COLORS.white,

    fontSize:18,

  },


});