import { COLORS } from "@/components/Colors";
import { redefinirSenha, validarOtpEmail } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
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

export default function RedefinirSenha() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function validarCodigo() {
    if (!email || !codigo.trim()) {
      Alert.alert("Atenção", "Informe o código recebido no e-mail.");
      return;
    }

    try {
      setCarregando(true);

      const response = await validarOtpEmail(email, codigo.trim());

      if (response.success && response.resetToken) {
        setResetToken(response.resetToken);
      } else {
        Alert.alert(
          "Erro",
          response.message || "Código inválido ou expirado."
        );
      }
    } catch (error) {
      console.error("Erro ao validar código:", error);

      Alert.alert(
        "Erro",
        "Não foi possível validar o código. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function salvar() {
    if (!resetToken) {
      Alert.alert("Atenção", "Valide o código antes de definir a nova senha.");
      return;
    }

    if (!novaSenha.trim() || !confirmarSenha.trim()) {
      Alert.alert("Atenção", "Preencha a nova senha e a confirmação.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não conferem.");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);

      await redefinirSenha(resetToken, novaSenha);

      Alert.alert("Sucesso", "Senha redefinida com sucesso. Você já pode fazer o login.", [
        { text: "OK", onPress: () => router.replace("/professor/login") },
      ]);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);

      Alert.alert(
        "Erro",
        "Não foi possível redefinir a senha. Tente novamente."
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
        <Text style={styles.title}>Redefinir Senha</Text>
        <Text style={styles.subtitle}>
          Digite o código enviado no e-mail e defina uma nova senha.
        </Text>

        <View style={styles.card}>
          {!resetToken ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Código de recuperação"
                placeholderTextColor={COLORS.muted}
                value={codigo}
                onChangeText={setCodigo}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
              />

              <Pressable
                style={[styles.button, carregando && styles.buttonDisabled]}
                onPress={validarCodigo}
                disabled={carregando}
              >
                {carregando ? (
                  <Text style={styles.buttonText}>Validando...</Text>
                ) : (
                  <Text style={styles.buttonText}>Validar código</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor={COLORS.muted}
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor={COLORS.muted}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={[styles.button, carregando && styles.buttonDisabled]}
                onPress={salvar}
                disabled={carregando}
              >
                {carregando ? (
                  <Text style={styles.buttonText}>Salvando...</Text>
                ) : (
                  <Text style={styles.buttonText}>Redefinir Senha</Text>
                )}
              </Pressable>
            </>
          )}
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
