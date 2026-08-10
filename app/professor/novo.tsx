import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { Professor, useProfessores } from '@/components/context/ProfessorContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


export default function NovoProfessor() {

  const { adicionarProfessor } = useProfessores();
  const { alunos } = useDojo();


  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [faixa, setFaixa] = useState('');
  const [graus, setGraus] = useState(0);
  const [especialidade, setEspecialidade] = useState('');



  const faixas = [
    "Branca",
    "Cinza",
    "Amarela",
    "Laranja",
    "Verde",
    "Azul",
    "Roxa",
    "Marrom",
    "Preta",
    "Coral",
    "Vermelha"
  ];



  const niveisGrau =
    faixa === 'Preta' ? 7 : 4;



  useEffect(() => {

    if (
      faixa !== 'Preta' &&
      graus > 4
    ) {

      setGraus(0);

    }

  }, [faixa]);





  async function salvar() {


    if (!nome.trim()) {

      Alert.alert(
        'Atenção',
        'Informe o nome do professor.'
      );

      return;

    }



    const nomeProfessor =
      nome.trim().toLowerCase();


    const emailProfessor =
      email.trim().toLowerCase();



    const alunoVinculado =
      alunos.find(
        (aluno) =>
          aluno.nome.toLowerCase() === nomeProfessor ||
          (
            emailProfessor &&
            aluno.email &&
            aluno.email.toLowerCase() === emailProfessor
          )
      );




    const professor: Professor = {

      id: Date.now().toString(),

      nome:
        nome.trim(),

      telefone:
        telefone.trim(),

      email:
        email.trim().toLowerCase(),


      // NOVO
      // vazio = sem acesso
      senha:
        senha.trim()
        ? senha.trim()
        : undefined,


      faixa:
        faixa.trim(),


      graus,


      especialidade:
        especialidade.trim(),


      ativo:true,


      alunoId:
        alunoVinculado?.id,

    };




    try {


      await adicionarProfessor(
        professor
      );



      Alert.alert(
        'Sucesso',
        `Professor cadastrado!${
          alunoVinculado
            ? `\nVinculado automaticamente ao aluno ${alunoVinculado.nome}.`
            : ''
        }${
          senha.trim()
            ? '\nAcesso liberado com senha.'
            : '\nProfessor cadastrado sem acesso.'
        }`
      );


      router.back();



    } catch(error){


      console.error(
        error
      );


      Alert.alert(
        'Erro',
        'Não foi possível cadastrar o professor.'
      );


    }


  }





  return (

    <KeyboardAvoidingView

      style={styles.keyboardContainer}

      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }

    >

    <ScrollView
      contentContainerStyle={styles.container}
    >


      <Text style={styles.title}>
        Novo professor
      </Text>



      <TextInput

        style={styles.input}

        placeholder="Nome completo"

        placeholderTextColor={COLORS.muted}

        value={nome}

        onChangeText={setNome}

      />



      <TextInput

        style={styles.input}

        placeholder="Telefone"

        placeholderTextColor={COLORS.muted}

        keyboardType="phone-pad"

        value={telefone}

        onChangeText={setTelefone}

      />



      <TextInput

        style={styles.input}

        placeholder="E-mail"

        placeholderTextColor={COLORS.muted}

        keyboardType="email-address"

        value={email}

        onChangeText={setEmail}

        autoCapitalize="none"

      />




      <TextInput

        style={styles.input}

        placeholder="Senha de acesso (opcional)"

        placeholderTextColor={COLORS.muted}

        secureTextEntry

        value={senha}

        onChangeText={setSenha}

      />




      <TextInput

        style={styles.input}

        placeholder="Especialidade (opcional)"

        placeholderTextColor={COLORS.muted}

        value={especialidade}

        onChangeText={setEspecialidade}

      />




      <Text style={styles.label}>
        Faixa atual
      </Text>


      <View style={styles.options}>


        {faixas.map(item=>(

          <Pressable

            key={item}

            style={[
              styles.option,
              faixa === item &&
              styles.optionActive
            ]}

            onPress={() =>
              setFaixa(item)
            }

          >

            <Text style={styles.optionText}>
              {item}
            </Text>

          </Pressable>

        ))}


      </View>




      <Text style={styles.label}>
        Graus
      </Text>



      <View style={styles.options}>


        {
          Array.from(
            {
              length:niveisGrau
            },
            (_,i)=>i+1
          )
          .map(item=>(


            <Pressable

              key={item}

              onPress={() =>
                setGraus(item)
              }

            >

              <Text

                style={[
                  styles.grau,

                  item <= graus &&
                  styles.grauActive
                ]}

              >

                ●

              </Text>


            </Pressable>


          ))
        }


      </View>




      <View style={styles.infoBox}>


        <Text style={styles.infoText}>

          ℹ️ Se um aluno com o mesmo nome ou e-mail já existir, o cadastro será vinculado automaticamente.

          {'\n\n'}

          A senha é opcional. Sem senha, o professor não terá acesso ao aplicativo.

        </Text>


      </View>





      <Pressable

        style={styles.button}

        onPress={salvar}

      >

        <Text style={styles.buttonText}>
          Salvar professor
        </Text>


      </Pressable>




    </ScrollView>


    </KeyboardAvoidingView>

  );

}




const styles = StyleSheet.create({

  keyboardContainer:{
    flex:1,
    backgroundColor:COLORS.background
  },


  container:{
    padding:25,
    paddingTop:70
  },


  title:{
    color:COLORS.white,
    fontSize:30,
    fontWeight:'bold',
    marginBottom:25
  },


  input:{
    backgroundColor:COLORS.card,
    borderColor:COLORS.border,
    borderRadius:15,
    borderWidth:1,
    color:COLORS.white,
    marginBottom:15,
    padding:15
  },


  label:{
    color:COLORS.white,
    fontWeight:'bold',
    marginBottom:10,
    marginTop:10
  },


  options:{
    flexDirection:'row',
    flexWrap:'wrap',
    gap:10,
    marginBottom:10
  },


  option:{
    backgroundColor:COLORS.card,
    borderColor:COLORS.border,
    borderRadius:12,
    borderWidth:1,
    padding:12,
    marginRight:10,
    marginBottom:10
  },


  optionActive:{
    backgroundColor:COLORS.primary,
    borderColor:COLORS.primary
  },


  optionText:{
    color:COLORS.white
  },


  grau:{
    fontSize:35,
    color:"#555",
    marginRight:10
  },


  grauActive:{
    color:COLORS.primary
  },


  infoBox:{
    backgroundColor:COLORS.card,
    padding:15,
    borderRadius:12,
    marginTop:10
  },


  infoText:{
    color:COLORS.muted,
    lineHeight:20
  },


  button:{
    alignItems:'center',
    backgroundColor:COLORS.primary,
    borderRadius:15,
    marginTop:10,
    padding:17
  },


  buttonText:{
    color:COLORS.white,
    fontSize:16,
    fontWeight:'bold'
  }

});