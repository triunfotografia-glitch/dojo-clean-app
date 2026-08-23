import { COLORS } from '@/components/Colors';
import { useDojo } from '@/components/context/DojoContext';
import { usePix } from '@/components/context/PixContext';
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
  View,
} from 'react-native';

export default function Perfil() {

  const {
    chavePix,
    nomeRecebedor,
    cidadeRecebedor,
    salvarConfiguracaoPix,
  } = usePix();

  const { userLogado, logout } = useDojo(); // Agora userLogado e logout são obtidos corretamente do DojoContext


  const [chave, setChave] = useState('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');


  useEffect(() => {

    setChave(chavePix);
    setNome(nomeRecebedor);
    setCidade(cidadeRecebedor);

  }, [
    chavePix,
    nomeRecebedor,
    cidadeRecebedor
  ]);



  async function salvar() {

    if (!chave.trim()) {

      Alert.alert(
        'Chave PIX obrigatória',
        'Informe uma chave PIX para receber pagamentos.'
      );

      return;

    }


    await salvarConfiguracaoPix(
      chave,
      nome || 'DOJO LB',
      cidade || 'SAO PAULO'
    );


    Alert.alert(
      'PIX configurado',
      'Agora os alunos poderão gerar pagamentos PIX pelo financeiro.'
    );

  }

  function handleLogout() {
    Alert.alert(
      "Sair do Aplicativo",
      "Você tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/");
          },
        },
      ]
    );
  }



  return (

    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>
        Perfil da academia
      </Text>


      <Text style={styles.subtitle}>
        Configure os dados de recebimento.
      </Text>



      <View style={styles.card}>


        <Text style={styles.section}>
          Configuração PIX
        </Text>


        <Text style={styles.help}>
          Informe a chave PIX que receberá as mensalidades dos alunos.
        </Text>



        <TextInput
          style={styles.input}
          value={chave}
          onChangeText={setChave}
          placeholder="Chave PIX"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
        />


        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do recebedor"
          placeholderTextColor={COLORS.muted}
        />


        <TextInput
          style={styles.input}
          value={cidade}
          onChangeText={setCidade}
          placeholder="Cidade"
          placeholderTextColor={COLORS.muted}
        />



        <Pressable
          style={styles.button}
          onPress={salvar}
        >

          <Text style={styles.buttonText}>
            Salvar PIX
          </Text>

        </Pressable>



      </View>

      {/* Card visível apenas para o administrador principal */}
      {userLogado?.tipo === 'professor' && userLogado?.administrador === true && (
        <View style={styles.card}>
          <Text style={styles.section}>
            Gerenciar Acessos
          </Text>
          <Text style={styles.help}>
            Crie e edite os logins de professores.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/acessos')}
          >
            <Text style={styles.buttonText}>Gerenciar Acessos</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sair (Logout)</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>

  );

}



const styles = StyleSheet.create({

  container:{
    padding:25,
    paddingTop:70,
  },

  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },


  title:{
    color:COLORS.white,
    fontSize:32,
    fontWeight:'bold',
  },


  subtitle:{
    color:COLORS.muted,
    marginTop:8,
  },


  card:{
    backgroundColor:COLORS.card,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:18,
    padding:18,
    marginTop:30,
  },


  section:{
    color:COLORS.white,
    fontSize:20,
    fontWeight:'bold',
  },


  help:{
    color:COLORS.textSecondary,
    marginTop:8,
    marginBottom:18,
  },


  input:{
    backgroundColor:COLORS.background,
    borderColor:COLORS.border,
    borderWidth:1,
    borderRadius:12,
    padding:14,
    color:COLORS.white,
    marginBottom:12,
  },


  button:{
    backgroundColor:COLORS.primary,
    borderRadius:12,
    padding:15,
    alignItems:'center',
    marginTop:8,
  },


  buttonText:{
    color:COLORS.white,
    fontWeight:'bold',
  },

  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  logoutButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

});

