import { COLORS } from "@/components/Colors";
import { promptText } from "@/components/Prompt";
import { Professor, useProfessores } from "@/components/context/ProfessorContext";
import { router } from "expo-router";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function GerenciarAcessos() {
  const { professores, editarProfessor } = useProfessores();

  async function editarSenha(usuario: Professor) {
  promptText(
    `Alterar senha de ${usuario.nome}`,
    "Digite a nova senha. Deixe em branco para remover o acesso.",
    async (novaSenha) => {
      if (novaSenha === null) return;

      try {
        await editarProfessor({
          ...usuario,
          senha: novaSenha,
        });

        Alert.alert(
          "Sucesso",
          novaSenha.trim()
            ? "Senha alterada com sucesso."
            : "Acesso removido com sucesso."
        );
      } catch (error) {
        console.error(
          "Erro ao alterar senha:",
          error
        );

        Alert.alert(
          "Erro",
          "Não foi possível alterar a senha. Verifique a conexão com o servidor."
        );
      }
    },
    "secure-text",
    ""
  );
}
return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Gerenciar Acessos</Text>
      <Text style={styles.subtitle}>
        Defina as senhas de login para professores.
      </Text>

      <View>
        {professores.map((p) => (
          <View key={p.id} style={styles.userCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{p.nome}</Text>
              <Text style={styles.userStatus}>
                {p.temSenha ? "Acesso configurado" : "Sem acesso"}
              </Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => editarSenha(p)}
            >
              <Text style={styles.editButtonText}>Editar Senha</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
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
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.muted,
    fontWeight: "bold",
  },
  tabTextActive: {
    color: COLORS.white,
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
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 12,
  },
});

