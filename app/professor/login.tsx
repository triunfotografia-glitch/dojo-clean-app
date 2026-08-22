import { useDojo } from "@/components/context/DojoContext";
import { useProfessores } from "@/components/context/ProfessorContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const { login } = useDojo();
  const { recarregarProfessores } = useProfessores();

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    const nomeDigitado = nome.trim();
    const senhaDigitada = senha;

    // ==============================
    // VALIDAÇÃO
    // ==============================

    if (!nomeDigitado || !senhaDigitada) {
      Alert.alert(
        "Atenção",
        "Preencha nome e senha."
      );
      return;
    }

    // ==============================
    // EVITA DUPLO CLIQUE
    // ==============================

    if (carregando) {
      return;
    }

    try {
      setCarregando(true);

      // ==============================
      // LOGIN PELO DOJOCONTEXT
      // ==============================

      const usuario = await login(
        nomeDigitado,
        senhaDigitada
      );

      // ==============================
      // LOGIN RECUSADO
      // ==============================

      if (!usuario) {
        Alert.alert(
          "Erro",
          "Nome ou senha inválidos."
        );
        return;
      }

      // LOGIN APROVADO

router.replace("/(tabs)");
    
    } catch (error) {
      console.error(
        "Erro ao realizar login:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível realizar o login. Verifique sua conexão e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        DOJO LB
      </Text>

      <Text style={styles.subtitulo}>
        Acesso exclusivo para professores
      </Text>

      <View style={styles.card}>
        <Text style={styles.titulo}>
          Login Professor
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#777"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!carregando}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#777"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!carregando}
        />

        <TouchableOpacity
          style={[
            styles.botao,
            carregando &&
              styles.botaoDesativado,
          ]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Text style={styles.botaoTexto}>
              Entrar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.forgotPasswordButton
          }
          onPress={() =>
            router.push(
              "/esqueci-senha"
            )
          }
          disabled={carregando}
        >
          <Text
            style={
              styles.forgotPasswordText
            }
          >
            Esqueci minha senha
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  logo: {
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 2,
  },

  subtitulo: {
    textAlign: "center",
    color: "#666",
    fontSize: 17,
    marginBottom: 45,
  },

  card: {
    width: "100%",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#eeeeee",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },

  botao: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },

  botaoDesativado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  forgotPasswordButton: {
    marginTop: 20,
    alignItems: "center",
  },

  forgotPasswordText: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});