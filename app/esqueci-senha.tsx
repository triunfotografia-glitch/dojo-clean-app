import { COLORS } from "@/components/Colors";
import { promptText } from "@/components/Prompt";
import { Professor, useProfessores } from "@/components/context/ProfessorContext";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function EsqueciSenha() {
  const { professores, editarProfessor } = useProfessores();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [professorEncontrado, setProfessorEncontrado] = useState<Professor | null>(null);

  function redefinirSenha(usuario: Professor) {
    promptText(
      "Redefinir Senha",
      `Olá, ${usuario.nome}. Digite sua nova senha.`,
      (novaSenha) => {
        if (novaSenha === null) return; // Cancelado

        if (novaSenha.trim().length < 4) {
          Alert.alert("Senha muito curta", "A senha deve ter no mínimo 4 caracteres.");
          return;
        }

        editarProfessor({ ...usuario, senha: novaSenha });

        Alert.alert("Sucesso!", "Sua senha foi redefinida. Você já pode fazer o login.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      },
      "secure-text"
    );
  }

  function buscarUsuario() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Por favor, informe seu nome completo.");
      return;
    }

    const nomeBusca = nome.trim().toLowerCase();
    const encontrado = professores.find(
      (p) => p.nome.toLowerCase() === nomeBusca
    );
    if (encontrado) {
      setProfessorEncontrado(encontrado);
      setEmail("");
      return;
    }

    setProfessorEncontrado(null);
    Alert.alert("Usuário não encontrado", "Não encontramos nenhum professor com este nome.");
  }

  function confirmarEmail() {
    if (!professorEncontrado) return;

    if (!email.trim()) {
      Alert.alert("Atenção", "Por favor, informe o e-mail cadastrado.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();
    const emailCadastrado = professorEncontrado.email.trim().toLowerCase();

    if (emailNormalizado !== emailCadastrado) {
      Alert.alert("Erro", "E-mail não confere. Verifique o e-mail cadastrado e tente novamente.");
      return;
    }

    redefinirSenha(professorEncontrado);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ Voltar para o Login</Text>
      </Pressable>

      <Text style={styles.title}>Redefinir Senha</Text>
      <Text style={styles.subtitle}>
        {professorEncontrado
          ? "Confirme o e-mail cadastrado para continuar."
          : "Digite seu nome completo para localizar seu cadastro."}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        placeholderTextColor={COLORS.muted}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />

      {professorEncontrado && (
        <TextInput
          style={styles.input}
          placeholder="E-mail cadastrado"
          placeholderTextColor={COLORS.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      )}

      <Pressable style={styles.button} onPress={professorEncontrado ? confirmarEmail : buscarUsuario}>
        <Text style={styles.buttonText}>
          {professorEncontrado ? "Confirmar E-mail" : "Buscar Cadastro"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 25,
    justifyContent: "center",
  },
  back: {
    color: COLORS.textSecondary,
    fontSize: 16,
    position: "absolute",
    top: -100,
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});