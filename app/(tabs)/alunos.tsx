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
import {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";

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
            style={[
              styles.grau,
              item <= graus && styles.grauAtivo,
            ]}
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

        const nome =
          aluno.nome?.toLowerCase() || "";
        const faixa =
          aluno.faixa?.toLowerCase() || "";
        const turma =
          aluno.turma?.toLowerCase() || "";

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
      .sort((a, b) =>
        (a.nome || "")
          .localeCompare(b.nome || "")
      );
  }, [alunos, busca, mostrarAtivos]);

  return (
    <View style={styles.backgroundContainer}>
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient
            id="gradient-bg"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#000000"
            />
            <Stop
              offset="100%"
              stopColor="#121212"
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#gradient-bg)"
        />
      </Svg>

      <View style={styles.container}>
        <Text style={styles.logo}>Alunos</Text>
        <View style={styles.logoDivider} />
        <Text style={styles.subtitle}>
          Gerenciamento dos alunos do MEU DOJO
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/aluno/novo")}
        >
          <Text style={styles.buttonText}>
            + Novo aluno
          </Text>
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
            <Pressable
              onPress={() => setBusca("")}
            >
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.counter}>
          {alunosFiltrados.length} aluno(s)
        </Text>

        <View style={styles.filters}>
          <Pressable
            style={[
              styles.filterButton,
              !mostrarAtivos &&
                styles.filterActive,
            ]}
            onPress={() => setMostrarAtivos(false)}
          >
            <Text
              style={[
                styles.filterText,
                !mostrarAtivos &&
               styles.filterTextActive,
              ]}
            >
              Todos
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              mostrarAtivos &&
                styles.filterActive,
            ]}
            onPress={() => setMostrarAtivos(true)}
          >
            <Text
              style={[
                styles.filterText,
                mostrarAtivos &&
                  styles.filterTextActive,
              ]}
            >
              Ativos
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={alunosFiltrados}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Nenhum aluno encontrado
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const professorNome =
              item.professorId
                ? professores.find(
                    (p) =>
                      p.id === item.professorId
                  )?.nome
                : undefined;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  {item.foto ? (
                    <Image
                      source={{ uri: item.foto }}
                      style={styles.photo}
                    />
                  ) : (
                    <View style={styles.noPhoto}>
                      <Text style={styles.noPhotoText}>
                        Sem foto
                      </Text>
                    </View>
                  )}

                  <View style={styles.infoArea}>
                    <Text
                      style={styles.name}
                      numberOfLines={1}
                    >
                      {item.nome || "Sem nome"}
                    </Text>

                    <Text style={styles.info}>
                      Faixa:{" "}
                      {item.faixa ||
                        "Não informado"}
                    </Text>

                    <Text style={styles.info}>
                      Turma:{" "}
                      {item.turma ||
                        "Não informado"}
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionLine}>
                  <Text style={styles.gradLabel}>
                    Graus:
                  </Text>
                  {renderGraus(item.graus || 0)}
                </View>

                <Text style={styles.info}>
                  Professor:{" "}
                  {professorNome ||
                    "Não informado"}
                </Text>

                <Text style={styles.info}>
                  Mensalidade:{" "}
                  {item.mensalidade ||
                    "Não informado"}
                </Text>

                <Text
                  style={[
                    styles.status,
                    !item.ativo &&
                      styles.statusInativo,
                  ]}
                >
                  {item.ativo
                    ? "● ATIVO"
                    : "● INATIVO"}
                </Text>

                <Pressable
                  style={styles.profileButton}
                  onPress={() =>
                    router.push({
                      pathname: "/aluno/[id]",
                      params: {
                        id: item.id,
                      },
                    })
                  }
                >
                  <Text style={styles.profileText}>
                    Ver perfil
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 32,
    backgroundColor: "transparent",
  },

  list: {
    flex: 1,
  },

  logo: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 2,
  },

  logoDivider: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "400",
    marginTop: 0,
    marginBottom: 20,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  search: {
    flex: 1,
    backgroundColor: COLORS.card,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
  },

  clearText: {
    color: COLORS.muted,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },

  counter: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },

  filters: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 8,
  },

  filterButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },

  filterActive: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },

  filterText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "500",
  },

  filterTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  noPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1E1E1E",
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
    fontSize: 16,
    fontWeight: "600",
  },

  info: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },

  sectionLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },

  gradLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  grausContainer: {
    flexDirection: "row",
    gap: 4,
  },

  grau: {
    color: COLORS.muted,
    fontSize: 16,
  },

  grauAtivo: {
    color: COLORS.primary,
  },

  status: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },

  statusInativo: {
    color: COLORS.muted,
  },

  profileButton: {
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  profileText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },

  empty: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
