import { COLORS } from "@/components/Colors";
import { useDojo } from "@/components/context/DojoContext";
import { useProfessores } from "@/components/context/ProfessorContext";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Alunos() {
  const { alunos } = useDojo();
  const { professores } = useProfessores();

  const [busca, setBusca] = useState("");
  const [mostrarAtivos, setMostrarAtivos] = useState(false);

  function renderGraus(graus: number = 0) {
    return (
      <View style={styles.grausContainer}>
        {[1, 2, 3, 4].map((item) => (
          <Text
            key={item}
            style={[styles.grau, item <= graus && styles.grauAtivo]}
          >
            ●
          </Text>
        ))}
      </View>
    );
  }

  const alunosFiltrados = useMemo(() => {
    return alunos
      .filter((aluno) => {
        const texto = busca.toLowerCase();

        const nome = aluno.nome?.toLowerCase() || "";
        const faixa = aluno.faixa?.toLowerCase() || "";
        const turma = aluno.turma?.toLowerCase() || "";

        const encontrado =
          nome.includes(texto) ||
          faixa.includes(texto) ||
          turma.includes(texto);

        if (!encontrado) {
          return false;
        }

        if (mostrarAtivos) {
          return aluno.ativo;
        }

        return true;
      })
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }, [alunos, busca, mostrarAtivos]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Alunos</Text>
      <Text style={styles.subtitle}>Gerenciamento dos alunos do MEU DOJO</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/aluno/novo")}
      >
        <Text style={styles.buttonText}>+ Novo aluno</Text>
      </Pressable>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Buscar aluno por nome, faixa ou turma..."
          placeholderTextColor={COLORS.muted}
          value={busca}
          onChangeText={setBusca}
        />

        {busca.length > 0 && (
          <Pressable style={styles.clearButton} onPress={() => setBusca("")}>
            <Text style={styles.clearText}>X</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.counter}>
        {alunosFiltrados.length} aluno(s)
      </Text>

      <View style={styles.filters}>
        <Pressable
          style={[styles.filterButton, !mostrarAtivos && styles.filterActive]}
          onPress={() => setMostrarAtivos(false)}
        >
          <Text style={styles.filterText}>Todos</Text>
        </Pressable>

        <Pressable
          style={[styles.filterButton, mostrarAtivos && styles.filterActive]}
          onPress={() => setMostrarAtivos(true)}
        >
          <Text style={styles.filterText}>Ativos</Text>
        </Pressable>
      </View>

      <FlatList
        data={alunosFiltrados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
          </View>
        }
        renderItem={({ item }) => {
          const professorNome = item.professorId
            ? professores.find((p) => p.id === item.professorId)?.nome
            : undefined;
          return (
          <View style={styles.card}>
            <View style={styles.header}>
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={styles.photo} />
              ) : (
                <View style={styles.noPhoto}>
                  <Text style={styles.noPhotoText}>Sem foto</Text>
                </View>
              )}

              <View style={styles.infoArea}>
                <Text style={styles.name}>{item.nome || "Sem nome"}</Text>

                <Text style={styles.info}>
                  Faixa: {item.faixa || "Não informado"}
                </Text>

                <Text style={styles.info}>
                  Turma: {item.turma || "Não informado"}
                </Text>
              </View>
            </View>

            <View style={styles.sectionLine}>
              <Text style={styles.info}>Graus:</Text>
              {renderGraus(item.graus || 0)}
            </View>

            <Text style={styles.info}>
              Professor: {professorNome || "Não informado"}
            </Text>

            <Text style={styles.info}>
              Mensalidade: {item.mensalidade || "Não informado"}
            </Text>

            <Text style={styles.status}>
              {item.ativo ? "● ATIVO" : "● INATIVO"}
            </Text>

            <Pressable
              style={styles.profileButton}
              onPress={() =>
                router.push({
                  pathname: "/aluno/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.profileText}>Ver perfil</Text>
            </Pressable>
          </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 25,
    paddingTop: 70,
  },
  logo: {
    color: COLORS.primary,
    fontSize: 38,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    backgroundColor: COLORS.card,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  clearButton: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  clearText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  counter: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  noPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  noPhotoText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  infoArea: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  info: {
    color: COLORS.textSecondary,
    marginTop: 7,
  },
  sectionLine: {
    marginTop: 15,
  },
  grausContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  grau: {
    color: "#555",
    fontSize: 24,
    marginRight: 5,
  },
  grauAtivo: {
    color: COLORS.primary,
  },
  status: {
    color: COLORS.primary,
    marginTop: 12,
    fontWeight: "bold",
  },
  profileButton: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  profileText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  empty: {
    backgroundColor: COLORS.card,
    padding: 25,
    borderRadius: 20,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
  },
});
