import React, { useState } from "react";
import { COLORS } from "@/components/Colors";
import { Professor, useProfessores } from "@/components/context/ProfessorContext";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function GerenciarAcessos() {
  const { professores, editarProfessor } = useProfessores();

  const [senhaModal, setSenhaModal] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] =
    useState<Professor | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  function editarSenha(usuario: Professor) {
    setProfessorSelecionado(usuario);
    setNovaSenha("");
    setSenhaModal(true);
  }

  function fecharModalSenha() {
    if (salvandoSenha) return;

    setSenhaModal(false);
    setProfessorSelecionado(null);
    setNovaSenha("");
  }

  async function confirmarNovaSenha() {
    if (!professorSelecionado) return;

    if (!novaSenha.trim()) {
      Alert.alert("Erro", "A senha não pode ficar em branco.");
      return;
    }

    try {
      setSalvandoSenha(true);

      await editarProfessor({
        ...professorSelecionado,
        senha: novaSenha,
        ativo: true,
      });

      setSenhaModal(false);
      setProfessorSelecionado(null);
      setNovaSenha("");

      Alert.alert(
        "Sucesso",
        "Senha alterada e acesso ativado."
      );
    } catch (error) {
      console.error("Erro ao alterar senha:", error);

      Alert.alert(
        "Erro",
        "Não foi possível alterar a senha. Verifique a conexão com o servidor."
      );
    } finally {
      setSalvandoSenha(false);
    }
  }

  function alternarAtivo(usuario: Professor) {
    const novoAtivo = !usuario.ativo;
    const acao = novoAtivo ? "ativar" : "desativar";

    Alert.alert(
      "Confirmar",
      `Deseja ${acao} o acesso de ${usuario.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: novoAtivo ? "default" : "destructive",
          onPress: async () => {
            try {
              await editarProfessor({
                ...usuario,
                ativo: novoAtivo,
              });

              Alert.alert(
                "Sucesso",
                `Acesso ${
                  novoAtivo ? "ativado" : "desativado"
                } com sucesso.`
              );
            } catch (error) {
              console.error(
                `Erro ao ${acao} acesso:`,
                error
              );

              Alert.alert(
                "Erro",
                `Não foi possível ${acao} o acesso. Verifique a conexão com o servidor.`
              );
            }
          },
        },
      ]
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Gerenciar Acessos
        </Text>

        <Text style={styles.subtitle}>
          Defina as senhas de login e o status dos professores.
        </Text>

        <View>
          {professores.map((p) => (
            <View key={p.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {p.nome}
                </Text>

                <Text style={styles.userStatus}>
                  {p.ativo ? "Ativo" : "Inativo"} |{" "}
                  {p.temSenha
                    ? "Acesso configurado"
                    : "Sem acesso"}
                </Text>
              </View>

              <View style={styles.buttonsRow}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => editarSenha(p)}
                >
                  <Text style={styles.editButtonText}>
                    Editar Senha
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.editButton,
                    p.ativo
                      ? styles.deactivateButton
                      : styles.activateButton,
                  ]}
                  onPress={() => alternarAtivo(p)}
                >
                  <Text style={styles.editButtonText}>
                    {p.ativo ? "Desativar" : "Ativar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={senhaModal}
        transparent
        animationType="fade"
        onRequestClose={fecharModalSenha}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Alterar senha
            </Text>

            <Text style={styles.modalMessage}>
              Digite a nova senha de{" "}
              {professorSelecionado?.nome}.
            </Text>

            <TextInput
              style={styles.passwordInput}
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder="Nova senha"
              placeholderTextColor="#888"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              editable={!salvandoSenha}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                ]}
                onPress={fecharModalSenha}
                disabled={salvandoSenha}
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                ]}
                onPress={confirmarNovaSenha}
                disabled={salvandoSenha}
              >
                <Text style={styles.confirmButtonText}>
                  {salvandoSenha ? "Salvando..." : "Salvar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
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
  },

  userCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  userStatus: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  buttonsRow: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },

  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },

  activateButton: {
    backgroundColor: "#4CAF50",
  },

  deactivateButton: {
    backgroundColor: COLORS.danger,
  },

  editButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#333",
  },

  modalTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalMessage: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },

  passwordInput: {
    backgroundColor: "#080808",
    color: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  cancelButton: {
    backgroundColor: "#333",
  },

  confirmButton: {
    backgroundColor: "#E10600",
  },

  cancelButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
