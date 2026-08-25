import { COLORS } from "@/components/Colors";
import { solicitarRecuperacaoEmail } from "@/services/api";
import { router } from "expo-router";
import { useState } from "react";
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
} from "react-native";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function solicitarRecuperacao() {
    if (!email.trim()) {
      Alert.alert("Atenção", "Informe o e-mail cadastrado.");
      return;
    }

    try {
      setCarregando(true);

      await solicitarRecuperacaoEmail(email.trim());

      router.replace({
        pathname: "/redefinir-senha",
        params: { email: email.trim() },
      });
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);

      Alert.alert(
        "Erro",
        "Não foi possível solicitar a recuperação. Tente novamente mais tarde."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Voltar para o Login</Text>
        </Pressable>

        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.subtitle}>
          Informe o e-mail cadastrado para receber o código de recuperação.
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="E-mail cadastrado"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Pressable
            style={[styles.button, carregando && styles.buttonDisabled]}
            onPress={solicitarRecuperacao}
            disabled={carregando}
          >
            {carregando ? (
              <Text style={styles.buttonText}>Enviando...</Text>
            ) : (
              <Text style={styles.buttonText}>Enviar código</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: 25,
    paddingTop: 70,
  },
  back: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginTop: 30,
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: COLORS.white,
    marginBottom: 12,
  },
  help: {
    color: COLORS.textSecondary,
    marginBottom: 18,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
