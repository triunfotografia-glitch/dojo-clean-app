import { useDojo } from "@/components/context/DojoContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function Login() {
  const { login } = useDojo();
  const router = useRouter();

  const [nome, setNome] = useState("Gabriel Triunfo");
  const [senha, setSenha] = useState("418221");

  function handleLogin() {
    if (!nome.trim() || !senha.trim()) {
      Alert.alert(
        "Atenção",
        "Preencha nome e senha."
      );
      return;
    }

    const usuario = login(
      nome.trim(),
      senha.trim()
    );

    if (!usuario) {
      Alert.alert(
        "Erro",
        "Nome ou senha inválidos."
      );
      return;
    }

    if (usuario.tipo !== "professor") {
      Alert.alert(
        "Acesso negado",
        "Esta área é restrita para professores."
      );
      return;
    }

    router.replace("/treinos");

  }
  return (

    <View style={styles.container}>


      <Text style={styles.titulo}>
        DOJO LB
      </Text>


      <Text style={styles.subtitulo}>
        Acesso do Professor
      </Text>


      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        placeholderTextColor="#777"
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />


      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#777"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />


      <TouchableOpacity
        style={styles.botao}
        onPress={handleLogin}
      >

        <Text style={styles.botaoTexto}>
          Entrar
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={() => router.push('/esqueci-senha')}
      >
        <Text style={styles.forgotPasswordText}>
          Esqueci minha senha
        </Text>
      </TouchableOpacity>


    </View>

  );

}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    padding:25,
    backgroundColor:"#fff",
  },
  titulo:{
    fontSize:34,
    fontWeight:"900",
    textAlign:"center",
    color:"#000",
    marginBottom:10,
  },
  subtitulo:{
    textAlign:"center",
    color:"#666",
    marginBottom:40,
    fontSize:16,
  },
  input:{
    backgroundColor:"#eeeeee",
    padding:15,
    borderRadius:12,
    marginBottom:15,
    fontSize:16,
    color:"#000",
  },
  botao:{
    backgroundColor:"#000",
    padding:16,
    borderRadius:12,
    marginTop:10,
  },
  botaoTexto:{
    color:"#fff",
    textAlign:"center",
    fontSize:16,
    fontWeight:"700",
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
});
